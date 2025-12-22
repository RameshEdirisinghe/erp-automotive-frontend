import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isLoginPage = window.location.pathname === "/login";

    if (
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/logout")
    ) {
      if (!isLoginPage) {
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        window.location.replace("/login");
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      try {
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch {
        if (!isLoginPage) {
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          window.location.replace("/login");
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
