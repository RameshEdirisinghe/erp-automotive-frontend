import api from "../api/axios";

export const fetchFromBackend = async (endpoint: string) => {
  try {
    const res = await api.get(endpoint);
    if (!res.status.toString().startsWith('2')) throw new Error("Failed to fetch data");

    const data = await res.data;
    return Array.isArray(data) ? data : [];
  } catch (_err) {
    return [];
  }
};

export const fetchSalesOverview = async () => {
  const res = await api.get("/invoices/analytics/sales-overview");
  return res.data;
};