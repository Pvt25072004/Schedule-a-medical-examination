// Admin Doctors API
import { getAuthHeaders } from "./http";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const DOCTORS_ENDPOINT = `${API_BASE_URL}/doctors`;

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

export const getDoctors = async () => {
  const response = await fetch(DOCTORS_ENDPOINT, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể tải danh sách bác sĩ");
};

export const createDoctor = async (payload) => {
  const response = await fetch(DOCTORS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(response, "Không thể tạo bác sĩ");
};

export const toggleDoctorActive = async (id) => {
  const response = await fetch(`${DOCTORS_ENDPOINT}/${id}/toggle-active`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể cập nhật trạng thái bác sĩ");
};

export const deleteDoctor = async (id) => {
  const response = await fetch(`${DOCTORS_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể xóa bác sĩ");
};


