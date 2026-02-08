import { getAuthHeaders } from "./http";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
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
  } catch {}
  throw new Error(message);
};

export const getAllPayments = async () => {
  const response = await fetch(PAYMENTS_ENDPOINT, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể tải danh sách thanh toán");
};


