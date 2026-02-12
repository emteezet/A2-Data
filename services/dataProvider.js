import axios from "axios";
import Transaction from "@/models/Transaction";
import { PROVIDER_STATUS, MAX_RETRIES } from "@/config/constants";

class DataProvider {
  constructor() {
    this.baseURL = process.env.DATA_PROVIDER_URL || "https://enterprise.mobilenig.com/api";
    this.publicKey = process.env.MOBILENIG_PUBLIC_KEY;
    this.secretKey = process.env.MOBILENIG_SECRET_KEY;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Public-Key": this.publicKey,
        "Secret-Key": this.secretKey,
        "Content-Type": "application/json",
      },
    });
  }

  async buyAirtime(networkCode, phoneNumber, amount, transId) {
    try {
      const response = await this.client.post("/airtime", {
        network: networkCode,
        phoneNumber: phoneNumber,
        amount: amount,
        trans_id: transId,
      });

      // MobileNig success codes are usually 200, 201, 202
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          providerReference: response.data.trans_id || transId,
          status: PROVIDER_STATUS.DELIVERED,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || "MobileNig airtime error",
          status: PROVIDER_STATUS.FAILED,
        };
      }
    } catch (error) {
      console.error("MobileNig Airtime Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: PROVIDER_STATUS.FAILED,
      };
    }
  }

  async buyData(dataPlanCode, phoneNumber, transId, networkCode) {
    try {
      const response = await this.client.post("/data", {
        network: networkCode,
        phoneNumber: phoneNumber,
        dataPlan: dataPlanCode,
        trans_id: transId,
      });

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          providerReference: response.data.trans_id || transId,
          status: PROVIDER_STATUS.DELIVERED,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || "MobileNig data error",
          status: PROVIDER_STATUS.FAILED,
        };
      }
    } catch (error) {
      console.error("MobileNig Data Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: PROVIDER_STATUS.FAILED,
      };
    }
  }

  async checkStatus(transId) {
    try {
      const response = await this.client.get(`/query-transaction/${transId}`);
      return {
        success: true,
        status: response.data.status,
        details: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
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
        await transaction.save();

        return { success: true, transaction };
      } else {
        transaction.retryCount += 1;
        transaction.providerStatus = PROVIDER_STATUS.RETRY;
        await transaction.save();

        return { error: result.error };
      }
    } catch (error) {
      return { error: error.message };
    }
  }
}

export const dataProvider = new DataProvider();
