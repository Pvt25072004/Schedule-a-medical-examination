import { getAuthHeaders } from "./http";
import { API_BASE_URL } from "../utils/constants";

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

export const createMedicalRecord = async (data) => {
  const response = await fetch(`${API_BASE_URL}/medical-records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return handleResponse(response, "Không thể lưu hồ sơ bệnh án");
};

export const getMedicalRecordByAppointment = async (appointmentId) => {
  const response = await fetch(`${API_BASE_URL}/medical-records/appointment/${appointmentId}`, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể tải hồ sơ bệnh án");
};
export const getMyMedicalRecords = async () => {
  const response = await fetch(`${API_BASE_URL}/medical-records/my-records`, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể tải danh sách hồ sơ bệnh án");
};
