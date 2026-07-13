import API from "../api";

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  const res = await API.post("/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getResume = async () => {
  const res = await API.get("/resume");
  return res.data;
};

export const deleteResume = async () => {
  const res = await API.delete("/resume");
  return res.data;
};

export const analyzeResume = async () => {
  const res = await API.post("/resume/analyze");
  return res.data;
};

export const matchWithJD = async (jobDescription) => {
  const res = await API.post("/resume/match-jd", { jobDescription });
  return res.data;
};
