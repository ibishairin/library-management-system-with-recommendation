import api from "./api";

export const loginUser = async (username, password) => {
  const response = await api.post("/login", {
    username,
    password,
  });

  const token = response.data.access_token;

  localStorage.setItem("token", token);

  return token;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};
