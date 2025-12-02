export const getAuthHeaders = () => {
  if (typeof window === "undefined") {
    return {};
  }
  const token =
    window.localStorage.getItem("token") ||
    window.sessionStorage.getItem("token");
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};


