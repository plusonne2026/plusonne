"use client";

import { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 28.6139, // Default to New Delhi if no location
  lng: 77.2090,
};

// Map styling for dark mode
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
  ],
};

interface LiveMapProps {
  userLocation?: { lat: number; lng: number };
  hostLocation?: { lat: number; lng: number };
  simulateMovement?: boolean;
}

export default function LiveMap({ userLocation, hostLocation: initialHostLocation, simulateMovement }: LiveMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [hostLocation, setHostLocation] = useState(initialHostLocation);

  const center = userLocation || hostLocation || defaultCenter;

  // Simulate host moving towards user if requested
  useEffect(() => {
    if (!simulateMovement || !userLocation || !initialHostLocation) return;
    
    setHostLocation(initialHostLocation);
    let currentLat = initialHostLocation.lat;
    let currentLng = initialHostLocation.lng;
    
    const interval = setInterval(() => {
      // Move 5% closer every 2 seconds
      currentLat += (userLocation.lat - currentLat) * 0.05;
      currentLng += (userLocation.lng - currentLng) * 0.05;
      setHostLocation({ lat: currentLat, lng: currentLng });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [simulateMovement, userLocation, initialHostLocation]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Fetch directions if both locations exist
  useEffect(() => {
    if (!isLoaded || !userLocation || !hostLocation) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: hostLocation,
        destination: userLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        }
      }
    );
  }, [isLoaded, userLocation, hostLocation]);

  if (!isLoaded) {
    return <div className="w-full h-full bg-[#131824] animate-pulse flex items-center justify-center text-zinc-500">Loading Map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {userLocation && (
        <Marker
          position={userLocation}
          title="Pickup Location"
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          }}
        />
      )}
      
      {hostLocation && (
        <Marker
          position={hostLocation}
          title="Host Location"
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          }}
        />
      )}

      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#0098FF",
              strokeWeight: 4,
              strokeOpacity: 0.8,
            },
          }}
        />
      )}
    </GoogleMap>
  );
}
