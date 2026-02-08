import axios from "axios";
import Transaction from "@/models/Transaction";
import { PROVIDER_STATUS, MAX_RETRIES } from "@/config/constants";

class DataProvider {
  constructor() {
    this.baseURL = process.env.DATA_PROVIDER_URL;
    this.apiKey = process.env.DATA_PROVIDER_API_KEY;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  generateRequestId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");

    return `${year}${month}${day}${hour}${minute}${seconds}${random}`;
  }

  async buyData(dataPlanCode, phoneNumber, reference, networkCode = "mtn-data") {
    try {
      const requestId = this.generateRequestId();

      const response = await this.client.post("/pay", {
        request_id: requestId,
        serviceID: networkCode,
        billersCode: phoneNumber,
        variation_code: dataPlanCode,
        amount: 0, // VTpass usually ignores this if variation_code is provided
        phone: phoneNumber,
      });

      if (response.data.code === "000") {
        return {
          success: true,
          providerReference: response.data.content.transactions.transactionId,
          status: PROVIDER_STATUS.DELIVERED,
        };
      } else {
        return {
          success: false,
          error: response.data.response_description || "VTpass error",
          status: PROVIDER_STATUS.FAILED,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.response_description || error.message,
        status: PROVIDER_STATUS.FAILED,
      };
    }
  }

  async checkStatus(providerReference) {
    try {
      const response = await this.client.get(`/status/${providerReference}`);
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
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return { error: "Transaction not found" };
    }

    if (transaction.retryCount >= MAX_RETRIES) {
      return { error: "Maximum retries exceeded" };
    }

    try {
      const result = await this.buyData(
        transaction.dataPlanId.toString(),
        transaction.phoneNumber,
        transaction.reference,
      );

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
