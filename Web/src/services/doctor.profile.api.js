// Doctor Profile API
import { getAuthHeaders } from "./http";

import { API_BASE_URL } from "../utils/constants";
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

export const uploadDoctorAvatar = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${DOCTORS_ENDPOINT}/upload`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
    credentials: "include",
  });
  return handleResponse(response, "Không thể tải lên ảnh đại diện");
};

// --- API Đơn Ứng Tuyển ---

export const createDoctorApplication = async (payload) => {
  const response = await fetch(`${DOCTORS_ENDPOINT}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(response, "Không thể gửi yêu cầu liên kết");
};

export const getMyDoctorApplications = async () => {
  const response = await fetch(`${DOCTORS_ENDPOINT}/me/applications`, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể tải danh sách đơn đã gửi");
};

