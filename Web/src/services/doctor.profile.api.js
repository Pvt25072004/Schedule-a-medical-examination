// Doctor Profile API
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

export const getMyDoctorProfile = async () => {
  const response = await fetch(`${DOCTORS_ENDPOINT}/me`, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể tải hồ sơ bác sĩ");
};

export const updateMyDoctorProfile = async (payload) => {
  const response = await fetch(`${DOCTORS_ENDPOINT}/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(response, "Không thể cập nhật hồ sơ bác sĩ");
};


