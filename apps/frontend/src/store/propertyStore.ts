import { create } from 'zustand';
import {
  fetchOffersByProperty,
  fetchSinglePropertyById,
  listAndFilterProperties,
} from '../services/api/property';

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
  _id: string;
  title: string;
  price: number;
  location: string;
  propertyType: string;
  city: string;
  state: string;
  area: string;
};

type Filter = {
  price?: number;
  location?: string;
  propertyType?: string;
  city?: string;
  state?: string;
  area?: string;
  marketLevel?: boolean;
  neighborhoodLevel?: boolean;
  low?: number;
  high?: number;
};

type PropertyFetchAndFilterStore = {
  selectedProperty: Property | null;
  offers: any[];
  selectProperty: (propertyId: string) => Promise<void>;
  properties: Property[];
  filters: Filter;
  setFilters: (filters: Filter) => void;
  setProperties: (properties: Property[]) => void;
  fetchProperties: () => Promise<void>;
};

export const usePropertyFetchAndFilterStore =
  create<PropertyFetchAndFilterStore>((set, get) => ({
    offers: [],
    selectedProperty: null,
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

        const { data: response } = await listAndFilterProperties(queryParams);
        set({ properties: response.data });
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      }
    },
    selectProperty: async (propertyId: string) => {
      const { data: response } = await fetchOffersByProperty(propertyId);
      const { data: foundProperty } = await fetchSinglePropertyById(propertyId);
      set({ selectedProperty: foundProperty.data, offers: response.data });
    },
  }));
