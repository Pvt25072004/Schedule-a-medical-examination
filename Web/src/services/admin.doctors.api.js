// Admin Doctors API
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

export const getDoctors = async () => {
  const response = await fetch(DOCTORS_ENDPOINT, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể tải danh sách bác sĩ");
};

export const getTopRatedDoctors = async () => {
  const response = await fetch(`${DOCTORS_ENDPOINT}/top-rated`, {
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });
  return handleResponse(response, "Không thể tải danh sách bác sĩ nổi bật");
};
