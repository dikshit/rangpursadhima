
import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.29.87:5000/api",
});

export const getUsers = () => API.get("/users");
export const createUser = (data) => API.post("/users", data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// ✅ Attendance endpoints
export const markAttendance = (user_id, slot) =>
  API.post("/attendance", { user_id, slot });

export const getAttendance = (user_id) =>
  API.get(`/attendance/${user_id}`);

export const getAttendanceLog = (user_id) =>
  API.get(`/attendance/${user_id}/log`);

// ✅ Image upload
export const uploadImage = (formData) =>
  API.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
