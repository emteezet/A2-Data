import axios from "axios";
import Transaction from "@/models/Transaction";
import { PROVIDER_STATUS, MAX_RETRIES } from "@/config/constants";

class DataProvider {
  constructor() {
    this.baseURL = process.env.DATA_PROVIDER_URL || "https://enterprise.mobilenig.com/api/v2";
    this.publicKey = process.env.MOBILENIG_PUBLIC_KEY;
    this.secretKey = process.env.MOBILENIG_SECRET_KEY;

    // Client without default auth, will set per request
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Format phone number to 11 digits (080...) for MobileNig.
   * MobileNig requires the local format for beneficiaries.
   * Converts 23480... to 080...
   */
  formatPhoneNumber(phone) {
    if (!phone) return "";
    let clean = String(phone).replace(/\D/g, "");

    // If it's already 11 digits starting with 0, it's correct
    if (clean.length === 11 && clean.startsWith("0")) {
      return clean;
    }

    // If it starts with 234 and is 13 digits, convert to 11 digits starting with 0
    if (clean.startsWith("234") && clean.length === 13) {
      return "0" + clean.slice(3);
    }

    // If it's 10 digits and doesn't start with 0 (e.g. 80...), prepend 0
    if (clean.length === 10 && !clean.startsWith("0")) {
      return "0" + clean;
    }

    return clean;
  }

  /**
   * MobileNig Airtime service_id mapping:
   * MTN STANDARD = "ABA", MTN PREMIUM = "ABA" (requestType: PREMIUM), MTN AWUF = "ABA" (requestType: AWUF)
   * GLO STANDARD = "ABB", GLO PREMIUM = "ABB" (requestType: PREMIUM)
   * AIRTEL STANDARD = "ABC", AIRTEL PREMIUM = "ABC" (requestType: PREMIUM)
   * 9MOBILE STANDARD = "ABD", 9MOBILE PREMIUM = "ABD" (requestType: PREMIUM)
   *
   * MobileNig Data service_id mapping:
   * MTN SME = "BCA" (service_type: SME), MTN GIFTING = "BCA" (service_type: GIFTING)
   * 9MOBILE SME = "BCB" (service_type: SME), 9MOBILE GIFTING = "BCB" (service_type: GIFTING)
   * GLO = "BCC"
   * AIRTEL SME = "BCD" (service_type: SME), AIRTEL GIFTING = "BCD" (service_type: GIFTING)
   */

  // Map network codes (providerCode from our DB) to MobileNig service_id
  // Map network codes (providerCode from our DB) to MobileNig service_id
  getAirtimeServiceId(networkCode, serviceType = "PREMIUM") {
    // Special handling for MTN AWUF
    if (String(networkCode) === "1" && serviceType === "AWUF") {
      return "BAD";
    }

    // Special handling for 9mobile Premium
    if (String(networkCode) === "4" && serviceType === "PREMIUM") {
      return "BAC";
    }

    const map = {
      "1": "ABA", // MTN (Premium/Standard)
      "2": "ABC", // Airtel
      "3": "ABB", // Glo
      "4": "ABD", // 9mobile (Standard)
    };
    return map[String(networkCode)] || null;
  }

  getDataServiceId(networkCode) {
    const map = {
      "1": "BCA",  // MTN
      "2": "BCD",  // Airtel
      "3": "BCC",  // Glo
      "4": "BCB",  // 9mobile
    };
    return map[String(networkCode)] || null;
  }

  // Helper to ensure trans_id is <= 15 chars for MobileNig
  formatTransId(transId) {
    if (!transId) return Date.now().toString();
    // Use last 15 chars if too long, or just the ID if short enough
    // Ideally we want unique, so maybe last 15 digits of timestamp/random
    return String(transId).slice(-15);
  }

  async checkBalance() {
    try {
      // Balance check requires PUBLIC KEY and /control/balance endpoint
      const response = await this.client.get("/control/balance", {
        headers: { "Authorization": `Bearer ${this.publicKey}` }
      });

      return {
        success: true,
        balance: response.data?.details?.balance || 0,
        raw: response.data
      };
    } catch (error) {
      console.error("MobileNig Balance Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Check if a data service is currently available.
   * GET /control/services_status?service_id=BCA&requestType=SME
   * Uses PUBLIC KEY.
   */
  async getServiceStatus(serviceId, requestType = "SME") {
    try {
      const response = await this.client.get("/control/services_status", {
        params: { service_id: serviceId, service_type: requestType, requestType },
        headers: { "Authorization": `Bearer ${this.publicKey}` },
        timeout: 15000,
      });

      return {
        success: true,
        available: response.data?.status === "available" || response.data?.statusCode === "200",
        raw: response.data,
      };
    } catch (error) {
      console.error("MobileNig Service Status Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Fetch live data plan packages from MobileNig.
   * POST /services/packages
   * Uses PUBLIC KEY.
   * Returns array of plans with price, productCode, name etc.
   */
  async getDataPlans(serviceId, serviceType = "SME") {
    try {
      const response = await this.client.post("/services/packages", {
        service_id: serviceId,
        service_type: serviceType,
        requestType: serviceType
      }, {
        headers: { "Authorization": `Bearer ${this.publicKey}` },
        timeout: 15000,
      });

      const data = response.data;

      // MobileNig returns packages in data.details
      const plans = data?.details || [];

      return {
        success: data.message === "success" || data.statusCode === "200",
        plans: Array.isArray(plans) ? plans : [],
        raw: data,
      };
    } catch (error) {
      console.error("MobileNig Data Packages Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        plans: [],
      };
    }
  }

  /**
   * Fetch all live data plans for a network (both SME and GIFTING).
   * Maps networkCode (providerCode) to MobileNig service_id.
   */
  async getLiveDataPlans(networkCode) {
    const serviceId = this.getDataServiceId(networkCode);
    if (!serviceId) {
      return { success: false, error: `Unsupported network code: ${networkCode}`, plans: [] };
    }

    // Fetch SME plans
    const smeResult = await this.getDataPlans(serviceId, "SME");

    // Fetch GIFTING plans (optional, may not exist for all networks)
    const giftingResult = await this.getDataPlans(serviceId, "GIFTING");

    const allPlans = [];

    if (smeResult.success && smeResult.plans.length > 0) {
      smeResult.plans.forEach(plan => {
        allPlans.push({ ...plan, type: "SME" });
      });
    }

    if (giftingResult.success && giftingResult.plans.length > 0) {
      giftingResult.plans.forEach(plan => {
        allPlans.push({ ...plan, type: "Coupon" });
      });
    }

    return {
      success: allPlans.length > 0,
      plans: allPlans,
      error: allPlans.length === 0 ? (smeResult.error || "No plans available") : undefined,
    };
  }

  async buyAirtime(networkCode, phoneNumber, amount, transId, serviceType = "PREMIUM") {
    try {
      const serviceId = this.getAirtimeServiceId(networkCode, serviceType);
      if (!serviceId) {
        return {
          success: false,
          error: `Unsupported network code: ${networkCode}`,
          status: PROVIDER_STATUS.FAILED,
        };
      }

      console.log(`[DataProvider] buyAirtime: serviceId=${serviceId}, serviceType=${serviceType}, phone=${phoneNumber}, amount=${amount}, transId=${transId}`);

      // MobileNig Airtime uses requestType for all networks (confirmed by manual tests)
      const typeParam = { service_type: serviceType, requestType: serviceType };

      // Transactions require SECRET KEY and Trailing Slash on /services/
      const response = await this.client.post("/services/", {
        service_id: serviceId,
        ...typeParam,
        phoneNumber: this.formatPhoneNumber(phoneNumber),
        amount: amount,
        trans_id: this.formatTransId(transId),
      }, {
        headers: { "Authorization": `Bearer ${this.secretKey}` }
      });

      const data = response.data;
      console.log(`[DataProvider] buyAirtime Response:`, JSON.stringify(data));

      // MobileNig returns 200 OK even for failures. We MUST check the body.
      // Success formats observed: { message: "success", ... } or { status: "success", ... }
      if (data.message === "success" || data.status === "success" || data.statusCode === "200") {
        return {
          success: true,
          providerReference: data.trans_id || transId,
          status: PROVIDER_STATUS.DELIVERED,
          data: data,
        };
      } else {
        return {
          success: false,
          error: data.details || data.message || "MobileNig airtime error",
          status: PROVIDER_STATUS.FAILED,
        };
      }
    } catch (error) {
      console.error("MobileNig Airtime Error:", error.response?.data || error.message);
      const errorData = error.response?.data;
      const errorMessage = typeof errorData === "object"
        ? (errorData?.details || errorData?.message || error.message)
        : (error.message);
      return {
        success: false,
        error: errorMessage,
        status: PROVIDER_STATUS.FAILED,
      };
    }
  }

  async buyData(dataPlanCode, phoneNumber, transId, networkCode, dataPlanPrice, serviceType = "SME") {
    try {
      const serviceId = this.getDataServiceId(networkCode);
      if (!serviceId) {
        return {
          success: false,
          error: `Unsupported network code: ${networkCode}`,
          status: PROVIDER_STATUS.FAILED,
        };
      }

      // MobileNig expects a numeric amount — for MTN SME, this must match the nominal amount (e.g. 1000 for 1GB code 1000)
      // For other networks or service types, we use the plan price.
      const isMtnSme = String(networkCode) === "1" && (serviceType === "SME" || !serviceType);

      console.log(`[DataProvider] buyData Logic Debug:`, {
        networkCode,
        serviceType,
        isMtnSme,
        dataPlanCode,
        dataPlanPrice,
        isNetwork1: String(networkCode) === "1",
        isSme: serviceType === "SME",
        isFalsyType: !serviceType
      });

      const numericAmount = isMtnSme
        ? parseFloat(dataPlanCode)
        : parseFloat(dataPlanPrice || dataPlanCode);

      console.log(`[DataProvider] Final amount determined: ${numericAmount}`);

      if (isNaN(numericAmount) || numericAmount <= 0) {
        return {
          success: false,
          error: `Invalid data plan amount: ${dataPlanPrice || dataPlanCode}`,
          status: PROVIDER_STATUS.FAILED,
        };
      }

      // Transactions require SECRET KEY and Trailing Slash on /services/
      const response = await this.client.post("/services/", {
        service_id: serviceId,
        service_type: serviceType || "SME",
        requestType: serviceType || "SME", // Backup for some legacy endpoints
        beneficiary: this.formatPhoneNumber(phoneNumber),
        trans_id: this.formatTransId(transId),
        code: dataPlanCode, // productCode from packages call
        amount: String(numericAmount), // price from packages call
      }, {
        headers: { "Authorization": `Bearer ${this.secretKey}` }
      });

      const data = response.data;

      if (data.message === "success" || data.status === "success" || data.statusCode === "200") {
        return {
          success: true,
          providerReference: data.trans_id || transId,
          status: PROVIDER_STATUS.DELIVERED,
          data: data,
        };
      } else {
        return {
          success: false,
          error: data.details || data.message || "MobileNig data error",
          status: PROVIDER_STATUS.FAILED,
        };
      }
    } catch (error) {
      console.error("MobileNig Data Error:", error.response?.data || error.message);
      const errorData = error.response?.data;
      const errorMessage = typeof errorData === "object"
        ? (errorData?.details || errorData?.message || error.message)
        : (error.message);
      return {
        success: false,
        error: errorMessage,
        status: PROVIDER_STATUS.FAILED,
      };
    }
  }

  async checkStatus(transId) {
    try {
      // Status check via control/query_transaction usually requires Public Key (like services_status)
      // Checking docs/tests: services_status used Public Key. 
      // Safest to use Public Key for GET /control endpoints.
      const response = await this.client.get(`/control/query_transaction?trans_id=${transId}`, {
        headers: { "Authorization": `Bearer ${this.publicKey}` }
      });
      return {
        success: true,
        status: response.data.status || response.data.message,
        details: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.details || error.message,
      };
    }
  }

  async retry(transactionId) {
    const transaction = await Transaction.findById(transactionId).populate("dataPlanId");

    if (!transaction) {
      return { error: "Transaction not found" };
    }

    if (transaction.retryCount >= MAX_RETRIES) {
      return { error: "Maximum retries exceeded" };
    }

    try {
      let result;
      if (transaction.dataPlanId) {
        result = await this.buyData(
          transaction.dataPlanId.providerCode,
          transaction.phoneNumber,
          transaction.reference,
          transaction.networkId.providerCode,
          transaction.nominalAmount || transaction.amount,
          transaction.dataPlanId.type || "SME"
        );
      } else {
        // Assume airtime if no dataPlanId
        result = await this.buyAirtime(
          transaction.networkId.providerCode,
          transaction.phoneNumber,
          transaction.amount,
          transaction.reference
        );
      }

      if (result.success) {
        transaction.providerReference = result.providerReference;
        transaction.providerStatus = result.status;
        transaction.retryCount += 1;
        transaction.errorMessage = undefined; // Clear previous error
        await transaction.save();

        return { success: true, transaction };
      } else {
        transaction.retryCount += 1;
        transaction.providerStatus = PROVIDER_STATUS.RETRY;
        transaction.errorMessage = result.error;
        await transaction.save();

        return { error: result.error };
      }
    } catch (error) {
      return { error: error.message };
    }
  }
}

export const dataProvider = new DataProvider();
