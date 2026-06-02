// Nếu có VITE_API_BASE_URL (trỏ tới backend trên EC2) thì dùng, ngược lại dùng "/api" để proxy local qua Vite/nginx
import { getAuthHeaders } from "./http";

import { API_BASE_URL } from "../utils/constants";
const APPOINTMENTS_ENDPOINT = `${API_BASE_URL}/appointments`;

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
    // ignore parse error, use default message
  }
  throw new Error(message);
};

export const getAppointments = async () => {
  const response = await fetch(APPOINTMENTS_ENDPOINT, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response, "Không thể tải danh sách lịch hẹn");
};

export const getAppointmentsByUser = async (userId) => {
  const response = await fetch(`${APPOINTMENTS_ENDPOINT}/user/${userId}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(
    response,
    "Không thể tải danh sách lịch hẹn của bệnh nhân",
  );
};

export const createAppointment = async (payload) => {
  const response = await fetch(APPOINTMENTS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Không thể tạo lịch hẹn");
};

export const updateAppointment = async (id, payload) => {
  const response = await fetch(`${APPOINTMENTS_ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Không thể cập nhật lịch hẹn");
};

export const updateAppointmentStatus = async (id, status, reason = "") => {
  const response = await fetch(`${APPOINTMENTS_ENDPOINT}/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status, reason }),
  });
  return handleResponse(response, "Không thể cập nhật trạng thái lịch hẹn");
};

export const deleteAppointment = async (id) => {
  const response = await fetch(`${APPOINTMENTS_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response, "Không thể xóa lịch hẹn");
};

export const getAvailableTimesForPackage = async (packageId, date) => {
  const url = `${APPOINTMENTS_ENDPOINT}/available-times/package?packageId=${packageId}&date=${date}`;
  const response = await fetch(url, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response, "Không thể tải danh sách khung giờ trống cho gói");
};

export const getAvailableDoctorsForPackage = async (packageId, date, time) => {
  const url = `${APPOINTMENTS_ENDPOINT}/available-doctors/package?packageId=${packageId}&date=${date}&time=${time}`;
  const response = await fetch(url, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response, "Không thể tải danh sách bác sĩ rảnh cho gói");
};
