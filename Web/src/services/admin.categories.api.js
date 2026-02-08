// Admin Categories (Chuyên khoa) API
import { getAuthHeaders } from "./http";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
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

export const createCategory = async (payload) => {
  const response = await fetch(CATEGORIES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(response, "Không thể tạo chuyên khoa");
};

export const updateCategory = async (id, payload) => {
  const response = await fetch(`${CATEGORIES_ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(response, "Không thể cập nhật chuyên khoa");
};

export const deleteCategory = async (id) => {
  const response = await fetch(`${CATEGORIES_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể xóa chuyên khoa");
};


