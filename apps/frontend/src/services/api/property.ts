import { api } from './api';
const moduleBaseUrl = '/property';
export const addProperty = (propertyData: any) =>
  api.post(`${moduleBaseUrl}/create`, propertyData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
const listFilterPropertiesUrl = `${moduleBaseUrl}/list`;

export const listAndFilterProperties = (queryParams: string) =>
  api.get(
    queryParams.length
      ? `${listFilterPropertiesUrl}?${queryParams}`
      : listFilterPropertiesUrl
  );
