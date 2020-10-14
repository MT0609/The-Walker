import axiosClient from "./axiosClient";

const userItemApi = {
  get: (params) => {
    const url = "/users";
    return axiosClient.get(url, { params });
  },
  create: (userID) => {
    const url = "/user-items";
    return axiosClient.post(url, userID);
  },
};

export default userItemApi;
