import { getAuthHeaders } from "./http";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const REVIEWS_ENDPOINT = `${API_BASE_URL}/reviews`;

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

export const createReview = async (payload) => {
  const response = await fetch(REVIEWS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Không thể gửi đánh giá");
};

export const getReviewsByDoctor = async (doctorId) => {
  const response = await fetch(`${REVIEWS_ENDPOINT}/doctor/${doctorId}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(
    response,
    "Không thể tải danh sách đánh giá của bác sĩ"
  );
};

export const getAllReviews = async () => {
  const response = await fetch(REVIEWS_ENDPOINT, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return handleResponse(response, "Không thể tải danh sách đánh giá");
};
