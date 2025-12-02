import { getAuthHeaders } from "./http";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
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
  } catch {}
  throw new Error(message);
};

export const getAppointmentsByDoctor = async (doctorId, date) => {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  const response = await fetch(
    `${APPOINTMENTS_ENDPOINT}/doctor/${doctorId}?${params.toString()}`,
    {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: "include",
    }
  );
  return handleResponse(
    response,
    "Không thể tải danh sách lịch hẹn của bác sĩ"
  );
};

export const updateAppointmentStatus = async (id, status, reason) => {
  const response = await fetch(`${APPOINTMENTS_ENDPOINT}/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(
      reason ? { status, reason } : { status }
    ),
    credentials: "include",
  });
  return handleResponse(
    response,
    "Không thể cập nhật trạng thái lịch hẹn của bác sĩ"
  );
};

