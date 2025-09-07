'use client';

import '@/lib/fixLeafletIcon';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';

type Issue = {
    id: string;
    title: string;
    latitude: number;
    longitude: number;
    location: string;
};

interface DynamicMapProps {
    issues: Issue[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}

// Component to center map on selected issue
function MapFocus({ selectedIssue }: { selectedIssue: Issue | undefined }) {
    const map = useMap();

    useEffect(() => {
        if (selectedIssue) {
            map.flyTo([selectedIssue.latitude, selectedIssue.longitude], 15, {
                duration: 1.2,
            });
        }
    }, [selectedIssue, map]);

    return null;
}

export default function DynamicMap({ issues, selectedId, onSelect }: DynamicMapProps) {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);
    if (!hasMounted) return null;

    const center: LatLngExpression = [22.7196, 75.8577];
    const selectedIssue = issues.find((issue) => issue.id === selectedId);

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Auto focus map when selectedIssue changes */}
            <MapFocus selectedIssue={selectedIssue} />

            {issues.map((issue) => (
                <CircleMarker
                    key={issue.id}
                    center={[issue.latitude, issue.longitude]}
                    radius={8}
                    pathOptions={{
                        color: issue.id === selectedId ? 'red' : 'blue',
                        fillColor: 'blue',
                        fillOpacity: 0.7,
                    }}
                    eventHandlers={{
                        click: () => onSelect(issue.id === selectedId ? null : issue.id),
                    }}
                >
                    {selectedId === issue.id && (
                        <Popup>
                            <strong>{issue.title}</strong>
                            <br />
                            {issue.location}
                        </Popup>
                    )}
                </CircleMarker>
            ))}
        </MapContainer>
    );
}
