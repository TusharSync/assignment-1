import { create } from 'zustand';
import { listAndFilterProperties } from '../services/api/property';

interface PropertyStore {
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
  propertyFormData: FormData | null;
  setPropertyFormData: (data: FormData) => void;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  isModalOpen: false,
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  propertyFormData: null,
  setPropertyFormData: (data) => set({ propertyFormData: data }),
}));

type Property = {
  title: string;
  price: number;
  location: string;
  propertyType: string;
  city: string;
  state: string;
  area: string;
  templateUrl?: string;
};

type Filter = {
  price?: number;
  location?: string;
  propertyType?: string;
  city?: string;
  state?: string;
  area?: string;
};

type PropertyFetchAndFilterStore = {
  properties: Property[];
  filters: Filter;
  setFilters: (filters: Filter) => void;
  setProperties: (properties: Property[]) => void;
  fetchProperties: () => Promise<void>;
};

export const usePropertyFetchAndFilterStore =
  create<PropertyFetchAndFilterStore>((set,get) => ({
    properties: [],
    filters: {},
    setFilters: (filters) => set({ filters }),
    setProperties: (properties) => set({ properties }),
    fetchProperties: async () => {
      const { filters } = get();
      try {
        const queryParams = new URLSearchParams(
          Object.entries(filters)
            .filter(([_, value]) => value !== undefined && value !== '')
            .map(([key, value]) => [key, value.toString()])
        ).toString();

        const response = await listAndFilterProperties(queryParams);
        set({ properties: response.data });
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      }
    },
  }));
