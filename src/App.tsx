import React from 'react';
import { Map } from './components/Map';
import { Sidebar } from './components/Sidebar';
import { useParkingStore } from './store/parkingStore';

function App() {
  const setUserLocation = useParkingStore((state) => state.setUserLocation);

  React.useEffect(() => {
    const requestLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    requestLocation();
  }, [setUserLocation]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 relative">
        <Map />
      </div>
    </div>
  );
}

export default App;