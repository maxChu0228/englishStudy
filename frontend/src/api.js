// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",  // Flask 的位址
  withCredentials: true             // 帶上 session cookie
});

export default api;
