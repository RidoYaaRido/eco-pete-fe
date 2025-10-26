// src/components/map/MapContainer.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Map, { 
    Marker, 
    Popup, 
    NavigationControl, 
    GeolocateControl, 
    FullscreenControl, 
    ViewStateChangeEvent
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLocationStore } from '@/store/locationStore';
import Link from 'next/link';
import { MapPin, Phone, Clock, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface Location {
  _id: string;
  name: string;
  type: string;
  location?: { coordinates?: [number, number] };
  address?: { street?: string; city?: string };
  contact?: { phone?: string };
  operatingHours?: any;
  rating?: { average: number; count: number };
  distance?: number;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function MapContainer() {
  const { locations, userLocation, setUserLocation, fetchLocations } = useLocationStore();

  const [viewport, setViewport] = useState({
    longitude: 106.8229,
    latitude: -6.2088,
    zoom: 12,
    pitch: 0,
    bearing: 0
  });

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewport(evt.viewState);
  }, []);

  // Fetch user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [ 
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(userCoords);
          setViewport(prev => ({
            ...prev,
            latitude: userCoords[0],
            longitude: userCoords[1], 
            zoom: 13 
          }));
          fetchLocations(userCoords[0], userCoords[1]);
        },
        (error) => {
          console.error('Error getting geolocation:', error);
          toast.error('Gagal mendapatkan lokasi Anda.');
          fetchLocations();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
      toast.warn('Browser tidak mendukung geolocation.');
      fetchLocations();
    }
  }, [fetchLocations, setUserLocation]);

  // Custom Marker Component
  const CustomMarker = ({ location }: { location: Location }) => {
    const longitude = location?.location?.coordinates?.[0];
    const latitude = location?.location?.coordinates?.[1];

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      console.warn(`Invalid coordinates for location: ${location.name || location._id}`);
      return null;
    }

    let markerColor = 'orange';
    if (location.type === 'bank_sampah') markerColor = '#16a34a'; // green-600
    else if (location.type === 'pengepul') markerColor = '#2563eb'; // blue-600
    else if (location.type === 'jasa_angkut') markerColor = '#f97316'; // orange-600
    else if (location.type === 'drop_point') markerColor = '#8b5cf6'; // purple-600

    return (
      <Marker
        longitude={longitude}
        latitude={latitude}
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setSelectedLocation(location);
          setViewport(prev => ({
            ...prev,
            longitude: longitude,
            latitude: latitude,
            zoom: Math.max(prev.zoom, 14),
          }));
        }}
        anchor="bottom"
      >
        <div 
            className="w-8 h-8 rounded-full border-3 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform flex items-center justify-center"
            style={{ backgroundColor: markerColor }}
            title={location.name}
        >
          <MapPin className="w-5 h-5 text-white" />
        </div>
      </Marker>
    );
  };

  return (
    <div className="relative w-full h-[calc(100vh-5rem)]">
      {!MAPBOX_TOKEN ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
          <p className="text-red-600 font-semibold text-center p-4">
            Error: Mapbox Access Token missing! <br/>
            Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file.
          </p>
        </div>
      ) : (
        <Map
          {...viewport}
          mapboxAccessToken={MAPBOX_TOKEN}
          onMove={handleMove}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Map Controls */}
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />
          <GeolocateControl
            position="top-right"
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation={true}
            showUserHeading
            onGeolocate={(pos) => {
               const userCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
               setUserLocation(userCoords);
               setViewport(prev => ({ 
                 ...prev, 
                 latitude: userCoords[0], 
                 longitude: userCoords[1], 
                 zoom: 14 
               }));
               fetchLocations(userCoords[0], userCoords[1]);
            }}
          />

          {/* User Location Marker */}
          {userLocation && (
            <Marker longitude={userLocation[1]} latitude={userLocation[0]} anchor="center">
               <div className="relative">
                 <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                 <div className="absolute inset-0 w-5 h-5 bg-blue-500 rounded-full border-2 border-white animate-ping opacity-75"></div>
               </div>
            </Marker>
          )}

          {/* Location Markers */}
          {locations.map((loc) => (
            <CustomMarker key={loc._id} location={loc} />
          ))}

          {/* Popup for selected location */}
          {selectedLocation && selectedLocation.location?.coordinates?.[0] && selectedLocation.location?.coordinates?.[1] && (
            <Popup
              longitude={selectedLocation.location.coordinates[0]} 
              latitude={selectedLocation.location.coordinates[1]}
              onClose={() => setSelectedLocation(null)}
              closeOnClick={false} 
              anchor="bottom"
              offset={30}
              className="custom-popup"
            >
              <div className="p-3 min-w-[250px]">
                <h3 className="font-bold text-base mb-2 text-gray-900">
                  {selectedLocation.name}
                </h3>
                
                <div className="space-y-2">
                  {/* Type Badge */}
                  <div className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    {selectedLocation.type === 'bank_sampah' && 'Bank Sampah'}
                    {selectedLocation.type === 'pengepul' && 'Pengepul'}
                    {selectedLocation.type === 'jasa_angkut' && 'Jasa Angkut'}
                    {selectedLocation.type === 'drop_point' && 'Drop Point'}
                  </div>

                  {/* Address */}
                  {selectedLocation.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        {selectedLocation.address.street && `${selectedLocation.address.street}, `}
                        {selectedLocation.address.city}
                      </span>
                    </div>
                  )}

                  {/* Phone */}
                  {selectedLocation.contact?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a 
                        href={`tel:${selectedLocation.contact.phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {selectedLocation.contact.phone}
                      </a>
                    </div>
                  )}

                  {/* Operating Hours */}
                  {selectedLocation.operatingHours?.monday && !selectedLocation.operatingHours.monday.isClosed && (
                     <div className="flex items-center gap-2">
                       <Clock className="w-4 h-4 text-gray-500" />
                       <span className="text-sm text-gray-700">
                         {selectedLocation.operatingHours.monday.open} - {selectedLocation.operatingHours.monday.close}
                       </span>
                     </div>
                   )}

                  {/* Rating */}
                  {selectedLocation.rating && selectedLocation.rating.average > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-sm text-gray-800">
                        {selectedLocation.rating.average.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({selectedLocation.rating.count} ulasan)
                      </span>
                    </div>
                  )}

                  {/* Distance */}
                  {selectedLocation.distance != null && (
                     <div className="text-sm text-green-600 font-semibold">
                       📍 {selectedLocation.distance.toFixed(2)} km dari Anda
                     </div>
                   )}
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex gap-2">
                   <Link
                     href={`/location/${selectedLocation._id}`}
                     className="flex-1 bg-green-600 text-white text-center py-2 px-3 rounded-lg hover:bg-green-700 text-sm font-medium transition"
                   >
                     Detail
                   </Link>
                   <a
                     href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.location?.coordinates?.[1]},${selectedLocation.location?.coordinates?.[0]}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                   >
                     Navigasi
                   </a>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      )}
    </div>
  );
}