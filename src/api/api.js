import axios from "axios";
import utils from "@/utils/utils";
import router from "@/router";
import { useAuthStore } from "../store/auth";
import pinia from "@/store/store";
import { Vue } from "vue-class-component";
import error from "@icon-park/vue-next/lib/icons/Error";

const store = useAuthStore(pinia);
Vue.prototype.$http = axios;
const api = axios.create({
  baseURL: "/api",
  //请求超时时间
  timeout: 30 * 1000,
  //允许跨域
  withCredentials: true,
  // cancelToken: source.token,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

//请求拦截器
api.interceptors.request.use(
  (config) => {
    let token = store.getToken;
    token && (config.headers.Authorization = "Bearer " + token);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//响应拦截器
api.interceptors.response.use(
  (response) => {
    // 处理响应数据
    if (response.data.code === 401) {
      // 跳转到 login 页面
      utils.remove("token");
      router.push("/");
      utils.showErrMessage(response.data.msg);
    } else if (response.data.code !== 200) {
      utils.showErrMessage(response.data.msg);
      return Promise.reject(response.data.msg);
    }
    return response;
  },
  (error) => {
    // 处理响应错误
    utils.showErrMessage(error);
    return Promise.reject(error);
  }
);

export default api;
