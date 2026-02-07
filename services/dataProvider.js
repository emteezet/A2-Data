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

  async buyData(dataPlanCode, phoneNumber, reference) {
    try {
      const response = await this.client.post("/purchase", {
        code: dataPlanCode,
        phone: phoneNumber,
        reference,
      });

      return {
        success: true,
        providerReference: response.data.reference,
        status: response.data.status || PROVIDER_STATUS.DELIVERED,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
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
