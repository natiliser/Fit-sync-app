import axios from "axios";

export const API_BASE_URL = "https://fit-sync-2n53.onrender.com";

const api = axios.create({
    baseURL: API_BASE_URL,
})

export default api;