import api from './api';

export const getWatchlist = async () => {
  const { data } = await api.get('/watchlist');
  return data.listings;
};

export const checkSaved = async (listingId) => {
  const { data } = await api.get(`/watchlist/check/${listingId}`);
  return data.saved;
};

export const saveToWatchlist = async (listingId) => {
  const { data } = await api.post(`/watchlist/${listingId}`);
  return data;
};

export const removeFromWatchlist = async (listingId) => {
  const { data } = await api.delete(`/watchlist/${listingId}`);
  return data;
};
