import axiosClient from "./axiosClient";

const userApi = {
  get: (params) => {
    const url = "/users";
    return axiosClient.get(url, { params });
  },
  getUserInfo: () => {
    const url = "/users/information";
    return axiosClient.get(url);
  },
  signIn: (body) => {
    const url = "/users/login";
    return axiosClient.post(url, body);
  },
  signUp: (body) => {
    const url = "/users/signup";
    return axiosClient.post(url, body);
  },
  changePass: (body) => {
    const url = "/users/information";
    return axiosClient.post(url, body);
  },
  forgot: (body) => {
    const url = "/users/recovery";
    return axiosClient.post(url, body);
  },
  forgotConfirm: (body) => {
    const url = "/users/forgot";
    return axiosClient.post(url, body);
  },
  delete: (body) => {
    const url = "/users/delete";
    return axiosClient.delete(url, body);
  },
};

export default userApi;
