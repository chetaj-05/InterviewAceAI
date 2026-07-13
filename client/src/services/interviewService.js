import API from "../api";

export const startInterview = async (data) => {
  const res = await API.post("/interview/start", data);
  return res.data;
};

export const submitAnswer = async (data) => {
  const res = await API.post("/interview/submit-answer", data);
  return res.data;
};

export const finishInterview = async (data) => {
  const res = await API.post("/interview/finish", data);
  return res.data;
};

export const getInterviews = async () => {
  const res = await API.get("/interview");
  return res.data;
};

export const getInterview = async (id) => {
  const res = await API.get(`/interview/${id}`);
  return res.data;
};

export const deleteInterview = async (id) => {
  const res = await API.delete(`/interview/${id}`);
  return res.data;
};

export const toggleBookmark = async (data) => {
  const res = await API.post("/interview/bookmark", data);
  return res.data;
};

export const getBookmarks = async () => {
  const res = await API.get("/interview/bookmarks");
  return res.data;
};
