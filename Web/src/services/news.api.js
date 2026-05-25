import { API_BASE_URL } from '../utils/constants';
import { getAuthHeaders } from './http';

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
      message = typeof errorBody.message === 'string' ? errorBody.message : errorBody.message.join?.(', ');
    }
  } catch {}
  throw new Error(message);
};

export const getPublicNews = async () => {
  const response = await fetch(`${API_BASE_URL}/news`, {
    headers: { ...getAuthHeaders() }
  });
  return handleResponse(response, "Không thể tải danh sách tin tức");
};

export const getNewsBySlug = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/news/${slug}`, {
    headers: { ...getAuthHeaders() }
  });
  return handleResponse(response, "Không thể tải bài viết");
};
