import { api } from './api';
const moduleBaseUrl = '/property';
export const addProperty = (propertyData: any) =>
  api.post(`${moduleBaseUrl}/create`, propertyData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
const listFilterPropertiesUrl = `${moduleBaseUrl}/all`;

export const listAndFilterProperties = (queryParams: string) =>
  api.get(
    queryParams.length
      ? `${listFilterPropertiesUrl}?${queryParams}`
      : listFilterPropertiesUrl
  );

export const fetchOffersByProperty = (propertyId: string) =>
  api.get(`${moduleBaseUrl}/${propertyId}/offers`);

export const fetchEmailThreadByOffer = (offerId: string) =>
  api.get(`${moduleBaseUrl}/offer/${offerId}/email-thread`);


export const fetchSinglePropertyById = (propertyId: string) =>
  api.get(`${moduleBaseUrl}/${propertyId}`);
