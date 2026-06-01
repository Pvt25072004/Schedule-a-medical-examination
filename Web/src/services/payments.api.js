// Payments demo API
import { getAuthHeaders } from "./http";

import { API_BASE_URL } from "../utils/constants";
const PAYMENTS_ENDPOINT = `${API_BASE_URL}/payments`;

const handleResponse = async (response, defaultErrorMessage) => {
  if (response.ok) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  let message = defaultErrorMessage;
  try {
    const errorBody = await response.json();
    if (errorBody?.message) {
      message =
        typeof errorBody.message === "string"
          ? errorBody.message
          : errorBody.message.join?.(", ");
    }
  } catch {
    // ignore parse error
  }
  throw new Error(message);
};

export const createPaymentDemo = async (payload) => {
  const response = await fetch(PAYMENTS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Không thể tạo thanh toán demo");
};

export const createVnpayUrl = async (payload) => {
  const response = await fetch(`${PAYMENTS_ENDPOINT}/vnpay/create-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Không thể tạo URL thanh toán VNPAY");
};

export const createPayosUrl = async (payload) => {
  const response = await fetch(`${PAYMENTS_ENDPOINT}/payos/create-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Không thể tạo URL thanh toán PayOS");
};
