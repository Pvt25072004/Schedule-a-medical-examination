import { getAuthHeaders } from "./http";
import { API_BASE_URL } from "../utils/constants";

const HOSPITAL_BANNERS_ENDPOINT = `${API_BASE_URL}/hospital-admin/banners`;

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
    // ignore parse error
  }

  throw new Error(message);
};

export const getActiveHospitalBanners = async () => {
  const response = await fetch(`${HOSPITAL_BANNERS_ENDPOINT}/active`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  return handleResponse(response, "Không thể tải banner đang hoạt động");
};
