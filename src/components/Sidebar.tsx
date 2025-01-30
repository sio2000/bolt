import React from 'react';
import { Menu, Car, MapPin, Settings, Navigation2 } from 'lucide-react';
import { useParkingStore } from '../store/parkingStore';
import { ParkingSpotSize } from '../types';

const DISTANCE_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 3, label: '3 km' },
  { value: 10, label: '10 km' },
];

const SPOT_SIZES: { value: ParkingSpotSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(true);
  const [selectedSize, setSelectedSize] = React.useState<ParkingSpotSize>('medium');
  const spots = useParkingStore((state) => state.spots);
  const userLocation = useParkingStore((state) => state.userLocation);
  const selectedDistance = useParkingStore((state) => state.selectedDistance);
  const setSelectedDistance = useParkingStore((state) => state.setSelectedDistance);
  const setSelectedSpot = useParkingStore((state) => state.setSelectedSpot);

  const filteredSpots = React.useMemo(() => {
    if (!userLocation) return spots;
    
    return spots.filter(spot => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        spot.latitude,
        spot.longitude
      );
      return distance <= selectedDistance;
    });
  }, [spots, userLocation, selectedDistance]);

  const handleUnpark = () => {
    if (!userLocation) return;
    
    const newSpot = {
      id: Date.now().toString(),
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      size: selectedSize,
      isAccessible: false,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1800000, // 30 minutes
      userId: 'user-1', // Replace with actual user ID
    };

    useParkingStore.getState().addSpot(newSpot);
  };

  const handleSpotClick = (spot: typeof spots[0]) => {
    setSelectedSpot(spot);
    // Open in Google Maps if available
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${spot.latitude},${spot.longitude}`;
      window.open(url, '_blank');
    }
  };

  const getSpotDistance = (spot: typeof spots[0]): string => {
    if (!userLocation) return '';
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      spot.latitude,
      spot.longitude
    );
    return distance.toFixed(1);
  };

  return (
    <div className={`bg-white h-full shadow-lg transition-all ${isOpen ? 'w-80' : 'w-16'}`}>
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className={`font-bold text-xl ${!isOpen && 'hidden'}`}>
          e-Parking
        </h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      {isOpen && (
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            {SPOT_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setSelectedSize(size.value)}
                className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${
                  selectedSize === size.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleUnpark}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            <Car size={20} />
            Unpark
          </button>

          <div className="mt-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance Filter
              </label>
              <select
                value={selectedDistance}
                onChange={(e) => setSelectedDistance(Number(e.target.value))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {DISTANCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Up to {option.label}
                  </option>
                ))}
              </select>
            </div>

            <h2 className="font-semibold mb-3">
              Nearby Parking Spots ({filteredSpots.length})
            </h2>
            <div className="space-y-3">
              {filteredSpots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => handleSpotClick(spot)}
                  className="w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span className="font-medium">Spot {spot.id}</span>
                    </div>
                    <Navigation2 size={16} className="text-blue-600" />
                  </div>
                  <div className="text-sm text-gray-600 mt-1 flex justify-between items-center">
                    <span>{spot.size} · {spot.isAccessible ? 'Accessible' : 'Standard'}</span>
                    <span className="text-blue-600 font-medium">{getSpotDistance(spot)} km</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 w-full border-t">
        <button className="p-4 w-full hover:bg-gray-100 flex items-center gap-2">
          <Settings size={20} />
          {isOpen && <span>Settings</span>}
        </button>
      </div>
    </div>
  );
}