

export const fetchFromBackend = async (endpoint: string) => {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error("Failed to fetch data");

    const data = await res.json();


    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Backend fetch error:", err);
    return [];
  }
};
