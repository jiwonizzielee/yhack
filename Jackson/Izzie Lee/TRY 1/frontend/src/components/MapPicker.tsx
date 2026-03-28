import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  onSelect: (location: string, lat: number, lng: number, radius: number) => void;
  onClose: () => void;
  initialCity?: string;
  initialState?: string;
}

export default function MapPicker({ onSelect, onClose, initialCity, initialState }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);

  const [radius, setRadius] = useState(10); // miles
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [locationName, setLocationName] = useState("");

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([39.5, -98.35], 4);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      setSelectedLat(lat);
      setSelectedLng(lng);

      // Reverse geocode using Nominatim
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        const city =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          "";
        const state = data.address?.state ?? "";
        setLocationName(city ? `${city}, ${state}` : state);
      } catch {
        setLocationName(`${lat.toFixed(2)}, ${lng.toFixed(2)}`);
      }
    });

    // Geocode initial city/state if provided
    if (initialCity || initialState) {
      const query = [initialCity, initialState].filter(Boolean).join(", ");
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`)
        .then((r) => r.json())
        .then((results) => {
          if (results[0]) {
            const lat = parseFloat(results[0].lat);
            const lng = parseFloat(results[0].lon);
            map.setView([lat, lng], 11);
            setSelectedLat(lat);
            setSelectedLng(lng);
            setLocationName(query);
          }
        })
        .catch(() => {});
    }

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [initialCity, initialState]);

  // Update circle when lat/lng/radius changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || selectedLat === null || selectedLng === null) return;

    const radiusMeters = radius * 1609.34;

    if (circleRef.current) circleRef.current.remove();
    if (markerRef.current) markerRef.current.remove();

    circleRef.current = L.circle([selectedLat, selectedLng], {
      radius: radiusMeters,
      color: "#000",
      fillColor: "#000",
      fillOpacity: 0.1,
      weight: 2,
    }).addTo(map);

    markerRef.current = L.circleMarker([selectedLat, selectedLng], {
      radius: 6,
      color: "#fff",
      fillColor: "#000",
      fillOpacity: 1,
      weight: 2,
    }).addTo(map);

    map.panTo([selectedLat, selectedLng]);
  }, [selectedLat, selectedLng, radius]);

  function handleConfirm() {
    if (selectedLat === null || selectedLng === null) return;
    onSelect(locationName, selectedLat, selectedLng, radius);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4 border-b border-[#E5E5EA] bg-white">
        <div>
          <h2 className="text-black text-lg font-bold">Pick a location</h2>
          <p className="text-[#8E8E93] text-xs mt-0.5">Tap the map to set your area</p>
        </div>
        <button type="button" onClick={onClose} className="text-black font-semibold text-sm">
          Cancel
        </button>
      </div>

      {/* Map */}
      <div ref={mapRef} className="flex-1 w-full" />

      {/* Bottom panel */}
      <div className="bg-white px-5 pt-4 pb-8 border-t border-[#E5E5EA] flex flex-col gap-3">
        {selectedLat !== null ? (
          <>
            <div>
              <p className="text-black font-semibold text-sm">{locationName || "Selected location"}</p>
              <p className="text-[#8E8E93] text-xs mt-0.5">{selectedLat.toFixed(4)}, {selectedLng!.toFixed(4)}</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[#8E8E93] text-xs font-medium">Search radius</p>
                <p className="text-black text-xs font-semibold">{radius} mi</p>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-black"
              />
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full bg-black text-white font-semibold py-4 rounded-2xl text-sm"
            >
              Use this location
            </button>
          </>
        ) : (
          <p className="text-center text-[#8E8E93] text-sm py-2">Tap anywhere on the map to select a location</p>
        )}
      </div>
    </div>
  );
}
