'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection, Geometry } from 'geojson';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuaWVsc29rb2xvdnNreSIsImEiOiJjbWVzM3Q5NmEwZHNoMm1wdzhzY3A2bTgzIn0.aqNOp8sYX69hOqRDr3wWvg';

// District colors mapping
const DISTRICT_COLORS: { [key: string]: string } = {
  '645': '#ef4444', // Hollywood Core - Red
  '646': '#f97316', // Central Hollywood - Orange
  '647': '#eab308', // Hollywood North - Yellow
  '656': '#8b5cf6', // Hollywood South - Purple
  '663': '#3b82f6', // Hollywood East - Blue
  '666': '#22c55e', // Hollywood West - Green
  '676': '#ec4899', // Hollywood Fringe - Pink
};

// District names mapping
const DISTRICT_NAMES: { [key: string]: string } = {
  '645': 'Hollywood Core',
  '646': 'Central Hollywood',
  '647': 'Hollywood North',
  '656': 'Hollywood South',
  '663': 'Hollywood East',
  '666': 'Hollywood West',
  '676': 'Hollywood Fringe',
};



// CHNC Boundary data
const CHNC_BOUNDARY_DATA = {
  "type": "FeatureCollection" as const,
  "features": [
    {
      "type": "Feature" as const,
      "geometry": {
        "type": "Polygon" as const,
        "coordinates": [[
          [-118.3452499,34.1014586,0],
          [-118.3441555,34.0979582,0],
          [-118.3441126,34.0943511,0],
          [-118.3434153,34.0943422,0],
          [-118.3433992,34.092583,0],
          [-118.3433992,34.0888957,0],
          [-118.3440804,34.0889002,0],
          [-118.3440751,34.0870787,0],
          [-118.3309859,34.0871142,0],
          [-118.3309805,34.0834666,0],
          [-118.3244306,34.08348,0],
          [-118.3244896,34.0944622,0],
          [-118.3244681,34.0946932,0],
          [-118.3243126,34.094973,0],
          [-118.3237493,34.0958837,0],
          [-118.3237278,34.0960481,0],
          [-118.3237708,34.1016674,0],
          [-118.3453035,34.1016007,0],
          [-118.3452499,34.1014586,0]
        ]]
      },
      "properties": {
        "name": "CHNC"
      }
    }
  ]
};

export default function HollywoodMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Use the districts data directly - no API needed for just 7 districts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [districtsData, setDistrictsData] = useState<any>(null);

  useEffect(() => {
    // Load the correct district data directly
    import('../data/hollywood-districts.json').then(data => {
      setDistrictsData(data.default);
    });
  }, []);

  useEffect(() => {
    if (map.current || !districtsData) return; // Initialize map only once

    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-118.330, 34.095], // Centered on Hollywood districts
      zoom: 12.5, // Wider view to show context and street names
      attributionControl: false,
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add the districts data source
      map.current.addSource('hollywood-districts', {
        type: 'geojson',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: districtsData as any,
      });

      // Fit the map to the bounds of all districts for an ideal initial view
      try {
        const bounds = new mapboxgl.LngLatBounds();
        const fc = districtsData as FeatureCollection<Geometry>;
        const extendBounds = (coords: unknown): void => {
          if (!coords) return;
          if (Array.isArray(coords) && typeof coords[0] === 'number') {
            const pair = coords as number[];
            bounds.extend([pair[0] as number, pair[1] as number]);
          } else if (Array.isArray(coords)) {
            (coords as unknown[]).forEach(extendBounds);
          }
        };
        if (fc && fc.features) {
          fc.features.forEach((f) => {
            const geom = f.geometry as Geometry | null;
            if (!geom) return;
            if (geom.type === 'GeometryCollection') {
              geom.geometries.forEach((g) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                extendBounds((g as any).coordinates as unknown);
              });
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              extendBounds((geom as any).coordinates as unknown);
            }
          });
        }
        const sw = bounds.getSouthWest?.();
        const ne = bounds.getNorthEast?.();
        if (sw && ne && sw.lng !== ne.lng && sw.lat !== ne.lat) {
          map.current.fitBounds(bounds, { padding: 40, maxZoom: 13 });
        }
      } catch {
        // noop: keep default center/zoom on any error
      }

      // Add district fill layer
      map.current.addLayer({
        id: 'districts-fill',
        type: 'fill',
        source: 'hollywood-districts',
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'REPDIST'], 645], DISTRICT_COLORS['645'],
            ['==', ['get', 'REPDIST'], 646], DISTRICT_COLORS['646'],
            ['==', ['get', 'REPDIST'], 647], DISTRICT_COLORS['647'],
            ['==', ['get', 'REPDIST'], 656], DISTRICT_COLORS['656'],
            ['==', ['get', 'REPDIST'], 663], DISTRICT_COLORS['663'],
            ['==', ['get', 'REPDIST'], 666], DISTRICT_COLORS['666'],
            ['==', ['get', 'REPDIST'], 676], DISTRICT_COLORS['676'],
            '#6b7280' // Default gray
          ],
          'fill-opacity': [
            'case',
            ['==', ['get', 'REPDIST'], ['literal', selectedDistrict ? parseInt(selectedDistrict) : -1]],
            0.8,
            0.6
          ],
        },
      });

      // Add district border layer
      map.current.addLayer({
        id: 'districts-border',
        type: 'line',
        source: 'hollywood-districts',
        paint: {
          'line-color': '#ffffff',
          'line-width': 2,
          'line-opacity': 0.8,
        },
      });

      // Add district labels
      map.current.addLayer({
        id: 'districts-labels',
        type: 'symbol',
        source: 'hollywood-districts',
        layout: {
          'text-field': ['get', 'REPDIST'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 14,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1,
        },
      });

      // Add CHNC boundary data source
      map.current.addSource('chnc-boundary', {
        type: 'geojson',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: CHNC_BOUNDARY_DATA as any,
      });

      // Add CHNC boundary layer (above districts, but non-interactive)
      map.current.addLayer({
        id: 'chnc-boundary',
        type: 'line',
        source: 'chnc-boundary',
        paint: {
          'line-color': '#0288d1', // Blue color from the original GeoJSON
          'line-width': 3,
          'line-opacity': 1,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      // Disable pointer events on CHNC boundary so clicks pass through to districts
      map.current.on('mouseenter', 'chnc-boundary', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

      // Add click handler for districts
      map.current.on('click', 'districts-fill', (e) => {
        if (e.features && e.features[0]) {
          const district = e.features[0].properties?.REPDIST?.toString();
          setSelectedDistrict(district === selectedDistrict ? null : district);
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'districts-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'districts-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [districtsData, selectedDistrict]);

  // Update fill opacity when selectedDistrict changes
  useEffect(() => {
    if (map.current && map.current.getLayer('districts-fill')) {
      map.current.setPaintProperty('districts-fill', 'fill-opacity', [
        'case',
        ['==', ['get', 'REPDIST'], ['literal', selectedDistrict ? parseInt(selectedDistrict) : -1]],
        0.8,
        0.6
      ]);
    }
  }, [selectedDistrict]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="relative">
        <div ref={mapContainer} className="w-full h-80 rounded-lg overflow-hidden shadow-sm border border-gray-200" />

        {/* District Info Panel */}
        {selectedDistrict && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: DISTRICT_COLORS[selectedDistrict] }}
              />
              <div>
                <h3 className="font-semibold text-gray-900">District {selectedDistrict}</h3>
                <p className="text-sm text-gray-800">{DISTRICT_NAMES[selectedDistrict]}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedDistrict(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4 text-sm mt-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Districts Coverage</h4>
          <div className="space-y-1">
            {Object.entries(DISTRICT_NAMES).slice(0, 4).map(([district, name]) => (
              <div key={district} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: DISTRICT_COLORS[district] }}
                />
                <span className="text-gray-900">{district} - {name}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="space-y-1 mt-6">
            {Object.entries(DISTRICT_NAMES).slice(4).map(([district, name]) => (
              <div key={district} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: DISTRICT_COLORS[district] }}
                />
                <span className="text-gray-900">{district} - {name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-700 mt-4">
        All districts are within the Hollywood area (Area 6) of the LAPD. Click districts to highlight.
      </p>
    </div>
  );
}
