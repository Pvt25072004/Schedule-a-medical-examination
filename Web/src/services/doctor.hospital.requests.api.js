import { getAuthHeaders } from "./http";
import { API_BASE_URL } from "../utils/constants";

const REQUESTS_ENDPOINT = `${API_BASE_URL}/doctor-hospital-requests`;

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
      message = typeof errorBody.message === "string" ? errorBody.message : errorBody.message.join?.(", ");
    }
  } catch {}
  throw new Error(message);
};

export const createDoctorHospitalRequest = async (payload) => {
  const response = await fetch(REQUESTS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(response, "Không thể gửi yêu cầu");
};

export const getMyRequests = async (doctorId) => {
  const response = await fetch(`${REQUESTS_ENDPOINT}/doctor/${doctorId}`, {
    headers: { ...getAuthHeaders() },
    credentials: "include",
  });
  return handleResponse(response, "Không thể tải danh sách yêu cầu");
};
