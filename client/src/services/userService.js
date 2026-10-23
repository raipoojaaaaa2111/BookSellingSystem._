import api from './api';

export const updateProfile = async (profileData) => {
  const { data } = await api.patch('/users/profile', profileData);
  return data.user;
};

export const changePassword = async (passwords) => {
  const { data } = await api.patch('/users/password', passwords);
  return data;
};

export const getUserProfile = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data.user;
};
