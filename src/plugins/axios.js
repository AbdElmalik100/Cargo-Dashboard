import axios from "axios";
import Cookies from "js-cookie";

const axiosRequest = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
})

axiosRequest.interceptors.request.use((config) => {
    if (Cookies.get("user_token")) config.headers.Authorization = `Token ${Cookies.get("user_token")}`
    return config
})

export default axiosRequest