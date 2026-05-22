// Doctor Schedules API
import { getAuthHeaders } from "./http";

import { API_BASE_URL } from "../utils/constants";
const SCHEDULES_ENDPOINT = `${API_BASE_URL}/schedules`;

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

export const getSchedulesByDoctor = async (doctorId) => {
  const response = await fetch(`${SCHEDULES_ENDPOINT}?doctorId=${doctorId}`, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể tải lịch làm việc");
};

export const getAvailableTimes = async (doctorId, date) => {
  const response = await fetch(`${API_BASE_URL}/appointments/available-times?doctorId=${doctorId}&date=${date}`, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể tải danh sách giờ khả dụng");
};

export const createSchedule = async (payload) => {
  const response = await fetch(SCHEDULES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(response, "Không thể tạo lịch làm việc");
};

export const updateSchedule = async (id, payload) => {
  const response = await fetch(`${SCHEDULES_ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(response, "Không thể cập nhật lịch làm việc");
};

export const deleteSchedule = async (id) => {
  const response = await fetch(`${SCHEDULES_ENDPOINT}/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể xóa lịch làm việc");
};
