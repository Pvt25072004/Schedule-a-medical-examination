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
          : errorBody.message.join(", ");
    }
  } catch {
    //
  }
  throw new Error(message);
};

export const initHospitalRegistration = async (data) => {
  const response = await fetch(`${API_BASE_URL}/hospital-registrations/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response, "Khởi tạo thất bại");
};

export const verifyHospitalRegistrationOtp = async (data) => {
  const response = await fetch(`${API_BASE_URL}/hospital-registrations/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response, "Xác thực OTP thất bại");
};

export const submitHospitalRegistration = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/hospital-registrations/${id}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response, "Gửi thông tin thất bại");
};
