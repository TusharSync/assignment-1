import { create } from 'zustand';
import { fetchEmailThreadByOffer } from '../services/api/property';

interface OfferStore {
  selectedOffer: string | null;
  emailThread: any[];
  selectOffer: (offerId: string) => Promise<void>;
}

export const useOfferStore = create<OfferStore>((set) => ({
  selectedOffer: null,
  emailThread: [],
  selectOffer: async (offerId: string) => {
    const { data: response } = await fetchEmailThreadByOffer(offerId);
    set({ selectedOffer: offerId, emailThread: response.data });
  },
}));
