import { API_BASE_URL } from "../utils/constants";
import { getAuthHeaders } from "./http";

export const getCities = async () => {
  const response = await fetch(`${API_BASE_URL}/cities`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    throw new Error("Không thể tải danh sách thành phố");
  }
  return response.json();
};
