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
  getAirtimeServiceId(networkCode) {
    const map = {
      "1": "ABA",  // MTN
      "2": "ABC",  // Airtel
      "3": "ABB",  // Glo
      "4": "ABD",  // 9mobile
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
    return String(transId).slice(0, 15);
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

  async buyAirtime(networkCode, phoneNumber, amount, transId) {
    try {
      const serviceId = this.getAirtimeServiceId(networkCode);
      if (!serviceId) {
        return {
          success: false,
          error: `Unsupported network code: ${networkCode}`,
          status: PROVIDER_STATUS.FAILED,
        };
      }

      // Transactions require SECRET KEY and Trailing Slash on /services/
      const response = await this.client.post("/services/", {
        service_id: serviceId,
        requestType: "PREMIUM",
        phoneNumber: phoneNumber,
        amount: amount,
        trans_id: this.formatTransId(transId),
      }, {
        headers: { "Authorization": `Bearer ${this.secretKey}` }
      });

      const data = response.data;

      // MobileNig returns message: "success" on success
      if (data.message === "success" || (response.status >= 200 && response.status < 300 && data.statusCode !== "SEC010")) {
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

  async buyData(dataPlanCode, phoneNumber, transId, networkCode) {
    try {
      const serviceId = this.getDataServiceId(networkCode);
      if (!serviceId) {
        return {
          success: false,
          error: `Unsupported network code: ${networkCode}`,
          status: PROVIDER_STATUS.FAILED,
        };
      }

      // Transactions require SECRET KEY and Trailing Slash on /services/
      const response = await this.client.post("/services/", {
        service_id: serviceId,
        service_type: "SME",
        beneficiary: phoneNumber,
        trans_id: this.formatTransId(transId),
        amount: dataPlanCode, // dataPlanCode is the plan amount/code for MobileNig
      }, {
        headers: { "Authorization": `Bearer ${this.secretKey}` }
      });

      const data = response.data;

      if (data.message === "success" || (response.status >= 200 && response.status < 300 && data.statusCode !== "SEC010")) {
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
          transaction.networkId.providerCode
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
