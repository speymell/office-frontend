import axios from "axios";

//process.env.REACT_APP_API_URL

const instance = axios.create({
  baseURL: "http://31.128.47.84:4444/",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  config.headers.Authorization = window.localStorage.getItem("token");
  return config;
});

export default instance;
