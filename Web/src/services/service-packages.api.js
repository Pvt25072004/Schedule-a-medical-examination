import { API_BASE_URL } from "../utils/constants";

export const getPopularServicePackages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/service-packages/popular`);
    if (!response.ok) {
      throw new Error("Không thể tải danh sách gói dịch vụ");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getAllServicePackages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/service-packages`);
    if (!response.ok) {
      throw new Error("Không thể tải danh sách gói dịch vụ");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getServicePackageById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/service-packages/${id}`);
    if (!response.ok) {
      throw new Error("Không thể tải thông tin gói dịch vụ");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};
