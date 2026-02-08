// Admin Hospitals API
// Dùng chung base URL với các service khác

import { getAuthHeaders } from "./http";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const HOSPITALS_ENDPOINT = `${API_BASE_URL}/hospitals`;

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

export const getHospitals = async () => {
  const response = await fetch(HOSPITALS_ENDPOINT, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể tải danh sách bệnh viện");
};

export const createHospital = async (payload) => {
  const response = await fetch(HOSPITALS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(response, "Không thể tạo bệnh viện");
};

export const updateHospital = async (id, payload) => {
  const response = await fetch(`${HOSPITALS_ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(response, "Không thể cập nhật bệnh viện");
};

export const deleteHospital = async (id) => {
  const response = await fetch(`${HOSPITALS_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể xóa bệnh viện");
};
