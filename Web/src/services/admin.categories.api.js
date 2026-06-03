// Admin Categories (Chuyên khoa) API
import { getAuthHeaders } from "./http";

import { API_BASE_URL } from "../utils/constants";
const CATEGORIES_ENDPOINT = `${API_BASE_URL}/categories`;

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

export const getCategories = async () => {
  const response = await fetch(CATEGORIES_ENDPOINT, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể tải danh sách chuyên khoa");
};
