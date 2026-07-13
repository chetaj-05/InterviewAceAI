import API from "../api";

export const getDashboardStats = async () => {
  const res = await API.get("/dashboard");
  return res.data;
};
