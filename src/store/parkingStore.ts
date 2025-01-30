import { create } from 'zustand';
import { ParkingSpot, UserLocation } from '../types';

interface ParkingState {
  spots: ParkingSpot[];
  userLocation: UserLocation | null;
  selectedSpot: ParkingSpot | null;
  selectedDistance: number;
  setSpots: (spots: ParkingSpot[]) => void;
  addSpot: (spot: ParkingSpot) => void;
  removeSpot: (spotId: string) => void;
  setUserLocation: (location: UserLocation) => void;
  setSelectedSpot: (spot: ParkingSpot | null) => void;
  setSelectedDistance: (distance: number) => void;
}

export const useParkingStore = create<ParkingState>((set) => ({
  spots: [],
  userLocation: null,
  selectedSpot: null,
  selectedDistance: 1, // Default to 1km
  setSpots: (spots) => set({ spots }),
  addSpot: (spot) => set((state) => ({ spots: [...state.spots, spot] })),
  removeSpot: (spotId) =>
    set((state) => ({
      spots: state.spots.filter((spot) => spot.id !== spotId),
    })),
  setUserLocation: (location) => set({ userLocation: location }),
  setSelectedSpot: (spot) => set({ selectedSpot: spot }),
  setSelectedDistance: (distance) => set({ selectedDistance: distance }),
}));