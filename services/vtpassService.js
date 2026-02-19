import axios from "axios";
import { logger } from "../lib/logger.js";
import { ProviderError } from "../lib/AppError.js";

/**
 * VTpass API Service Integration
 * Documentation: https://vtpass.com/documentation/
 */
class VTPassService {
    constructor() {
        this.apiUrl = process.env.VTPASS_API_URL || "https://sandbox.vtpass.com/api/";
        this.apiKey = process.env.VTPASS_API_KEY;
        this.publicKey = process.env.VTPASS_PUBLIC_KEY;
        this.secretKey = process.env.VTPASS_SECRET_KEY;

        this.client = axios.create({
            baseURL: this.apiUrl,
            timeout: 30000,
        });

        logger.debug(`VTPassService initialized for environment: ${this.apiUrl.includes('sandbox') ? 'SANDBOX' : 'PRODUCTION'}`);
    }

    /**
     * Generates a unique Request ID in the format YYYYMMDDHHII+6 Random Digits
     */
    generateRequestId() {
        const now = new Date();
        const options = {
            timeZone: "Africa/Lagos",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        };

        const formatter = new Intl.DateTimeFormat("en-GB", options);
        const parts = formatter.formatToParts(now);
        const datePart = {};
        parts.forEach(p => { datePart[p.type] = p.value; });

        const timestamp = `${datePart.year}${datePart.month}${datePart.day}${datePart.hour}${datePart.minute}`;
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

        return `${timestamp}${random}`;
    }

    getHeaders(isPost = true) {
        if (!this.apiKey) {
            logger.warn("VTpass API Key is missing!");
        }

        const headers = {
            "api-key": this.apiKey,
            "Content-Type": "application/json",
        };

        if (isPost) {
            headers["secret-key"] = this.secretKey;
        } else {
            headers["public-key"] = this.publicKey;
        }

        return headers;
    }

    getAirtimeServiceId(networkCode) {
        const code = String(networkCode).toLowerCase();
        const map = {
            "mtn": "mtn",
            "mtn-data": "mtn",
            "1": "mtn",

            "glo": "glo",
            "glo-data": "glo",
            "3": "glo",

            "airtel": "airtel",
            "airtel-data": "airtel",
            "2": "airtel",

            "9mobile": "etisalat",
            "9mobile-data": "etisalat",
            "4": "etisalat",
            "etisalat": "etisalat"
        };
        return map[code] || code;
    }

    async purchaseAirtime(networkCode, amount, phone) {
        const serviceID = this.getAirtimeServiceId(networkCode);
        const requestId = this.generateRequestId();
        logger.info(`Initiating Airtime Purchase [${requestId}]`, { serviceID, amount, phone });

        try {
            const response = await this.client.post("pay", {
                request_id: requestId,
                serviceID,
                amount,
                phone,
            }, {
                headers: this.getHeaders(true),
            });

            return await this.handleResponse(response.data, requestId);
        } catch (error) {
            return this.handleError(error, requestId, "Airtime Purchase");
        }
    }

    async getDataVariations(serviceID) {
        logger.debug(`Fetching Data Variations for ${serviceID}`);
        try {
            const response = await this.client.get(`service-variations?serviceID=${serviceID}`, {
                headers: this.getHeaders(false),
            });

            if (response.data.response_description !== "000") {
                logger.warn(`Failed to fetch variations for ${serviceID}`, response.data);
                return { success: false, error: response.data.response_description || "Failed to fetch variations" };
            }

            return {
                success: true,
                data: response.data.content,
            };
        } catch (error) {
            logger.error(`Error fetching variations for ${serviceID}`, error);
            return { success: false, error: error.message };
        }
    }

    async purchaseData(serviceID, billersCode, variationCode, phone) {
        const requestId = this.generateRequestId();
        logger.info(`Initiating Data Purchase [${requestId}]`, { serviceID, variationCode, phone });

        try {
            const response = await this.client.post("pay", {
                request_id: requestId,
                serviceID,
                billersCode,
                variation_code: variationCode,
                phone,
            }, {
                headers: this.getHeaders(true),
            });

            return await this.handleResponse(response.data, requestId);
        } catch (error) {
            return this.handleError(error, requestId, "Data Purchase");
        }
    }

    async requeryTransaction(requestId) {
        logger.info(`Requeurying Transaction [${requestId}]`);
        try {
            const response = await this.client.post("requery", { request_id: requestId }, {
                headers: this.getHeaders(true),
            });

            const success = response.data.code === "000";
            const status = response.data.content?.transactions?.status;

            if (success && status === "delivered") {
                logger.success(`Transaction [${requestId}] DELIVERED via Requery`);
            } else {
                logger.warn(`Transaction [${requestId}] Requery Result: ${status || 'Unknown'}`, response.data);
            }

            return {
                success,
                status,
                data: response.data,
            };
        } catch (error) {
            logger.error(`Requery Failed for [${requestId}]`, error);
            return { success: false, error: error.message };
        }
    }

    async handleResponse(data, requestId) {
        const code = data.code;

        if (code === "000") {
            const txStatus = data.content?.transactions?.status;
            if (txStatus === "delivered") {
                logger.success(`Transaction [${requestId}] SUCCESSFUL`);
                return { success: true, status: "delivered", data };
            }
            logger.warn(`Transaction [${requestId}] status: ${txStatus}`, data);
            return { success: true, status: txStatus, data, needsRequery: txStatus === "pending" };
        }

        logger.error(`VTpass API Response Error [${requestId}]`, null, { code, response: data.response_description || data });

        if (code === "099") {
            logger.info(`Transaction [${requestId}] is processing. Auto-requerying...`);
            return await this.requeryTransaction(requestId);
        }

        if (code === "020") {
            throw new ProviderError("Transaction already exists/processed (Duplicate Request ID)", 409, { requestId });
        }

        if (code === "016") {
            return { success: false, status: "failed", error: "Insufficient Wallet Balance in VTpass account", data };
        }

        // Fallback: treat as pending if code is unrecognized but not 016/011
        logger.info(`Unrecognized response code [${code}]. Requerying for safety...`);
        return await this.requeryTransaction(requestId);
    }

    async handleError(error, requestId, context) {
        const responseData = error.response?.data;
        const statusCode = error.response?.status;

        logger.error(`${context} HTTP Error [${requestId}]`, error, { statusCode, responseData });

        // Fallback Rule: treat as pending and initiate requery if timeout or no response
        if (error.code === "ECONNABORTED" || !error.response) {
            logger.warn(`Network timeout/error for [${requestId}]. Attempting requery...`);
            return await this.requeryTransaction(requestId);
        }

        if (statusCode === 401 || responseData?.code === "087") {
            throw new ProviderError("Invalid API Credentials for VTpass", 401, { responseData });
        }

        return {
            success: false,
            status: "error",
            error: responseData?.response_description || error.message,
            data: responseData,
        };
    }
}

export const vtpassService = new VTPassService();
