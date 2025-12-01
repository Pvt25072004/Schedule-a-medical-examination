// Nếu có VITE_API_BASE_URL (trỏ tới backend trên EC2) thì dùng, ngược lại dùng "/api" để proxy local qua Vite/nginx
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

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

export const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    credentials: "include",
  });
  return handleResponse(response, "Đăng nhập thất bại");
};

export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
    credentials: "include",
  });
  return handleResponse(response, "Đăng ký thất bại");
};

// Cập nhật thông tin user (dựa trên id trong URL)
export const updateUser = async (userId, payload) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(response, "Cập nhật thông tin thất bại");
};
