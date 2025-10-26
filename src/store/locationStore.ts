// src/store/locationStore.ts
import { create } from 'zustand';
import api from '@/lib/api';

interface Location {
  _id: string;
  name: string;
  type: 'bank_sampah' | 'pengepul' | 'daur_ulang';
  address: {
    street: string;
    city: string;
    province: string;
    coordinates: {
      type: string;
      coordinates: [number, number];
    };
  };
  contact: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  operationalHours: {
    open: string;
    close: string;
    days: string[];
  };
  wasteCategories: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  images?: string[];
  verified: boolean;
  averageRating?: number;
  totalReviews?: number;
  distance?: number;
}

interface LocationState {
  locations: Location[];
  selectedLocation: Location | null;
  isLoading: boolean;
  filters: {
    type: string;
    radius: number;
    wasteCategory: string;
    verified: boolean;
  };
  userLocation: [number, number] | null;

  // Actions
  fetchLocations: (lat?: number, lng?: number) => Promise<void>;
  fetchLocationById: (id: string) => Promise<void>;
  setSelectedLocation: (location: Location | null) => void;
  setFilters: (filters: Partial<LocationState['filters']>) => void;
  setUserLocation: (coords: [number, number]) => void;
  searchLocations: (query: string) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: [],
  selectedLocation: null,
  isLoading: false,
  filters: {
    type: '',
    radius: 10,
    wasteCategory: '',
    verified: false,
  },
  userLocation: null,

  fetchLocations: async (lat, lng) => {
    try {
      set({ isLoading: true });
      const { filters, userLocation } = get();
      
      const params: any = {};
      
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
        params.radius = filters.radius;
      } else if (userLocation) {
        params.lat = userLocation[0];
        params.lng = userLocation[1];
        params.radius = filters.radius;
      }
      
      if (filters.type) params.type = filters.type;
      if (filters.wasteCategory) params.wasteCategory = filters.wasteCategory;
      if (filters.verified) params.verified = true;

      const { data } = await api.get('/locations', { params });
      set({ locations: data.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching locations:', error);
      set({ isLoading: false });
    }
  },

  fetchLocationById: async (id) => {
    try {
      set({ isLoading: true });
      const { data } = await api.get(`/locations/${id}`);
      set({ selectedLocation: data.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching location:', error);
      set({ isLoading: false });
    }
  },

  setSelectedLocation: (location) => {
    set({ selectedLocation: location });
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().fetchLocations();
  },

  setUserLocation: (coords) => {
    set({ userLocation: coords });
  },

  searchLocations: async (query) => {
    try {
      set({ isLoading: true });
      const { data } = await api.get(`/locations?search=${query}`);
      set({ locations: data.data, isLoading: false });
    } catch (error) {
      console.error('Error searching locations:', error);
      set({ isLoading: false });
    }
  },
}));