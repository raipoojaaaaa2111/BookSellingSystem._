import api from './api';

/**
 * listingService — all API calls related to listings.
 *
 * We keep API calls in service files instead of directly in components.
 * This means if the API URL changes, you fix it in one place,
 * not in every component that uses it.
 */

// Get all listings — supports search, filter, sort, pagination via query params
export const getListings = async (params = {}) => {
  const { data } = await api.get('/listings', { params });
  return data;
};

// Get single listing by ID
export const getListingById = async (id) => {
  const { data } = await api.get(`/listings/${id}`);
  return data.listing;
};

// Create a new listing
export const createListing = async (listingData) => {
  const { data } = await api.post('/listings', listingData);
  return data.listing;
};

// Update an existing listing
export const updateListing = async (id, listingData) => {
  const { data } = await api.put(`/listings/${id}`, listingData);
  return data.listing;
};

// Delete a listing
export const deleteListing = async (id) => {
  const { data } = await api.delete(`/listings/${id}`);
  return data;
};

// Mark a listing as sold/exchanged/donated
export const closeListingStatus = async (id, status) => {
  const { data } = await api.patch(`/listings/${id}/status`, { status });
  return data.listing;
};

// Get the logged-in user's own listings
export const getMyListings = async () => {
  const { data } = await api.get('/listings/my');
  return data.listings;
};
