'use client';

import { useEffect, useRef } from 'react';

// Hollywood districts data with approximate boundaries
const hollywoodDistricts = [
  { id: '645', name: 'Hollywood Core', color: '#ef4444', description: 'Central Hollywood entertainment district' },
  { id: '646', name: 'Central Hollywood', color: '#f97316', description: 'High foot traffic area' },
  { id: '647', name: 'Hollywood North', color: '#eab308', description: 'Residential with commercial mix' },
  { id: '666', name: 'Hollywood West', color: '#22c55e', description: 'Mixed residential/commercial' },
  { id: '663', name: 'Hollywood East', color: '#3b82f6', description: 'Residential area' },
  { id: '656', name: 'Hollywood South', color: '#8b5cf6', description: 'Mixed-use area' },
  { id: '676', name: 'Hollywood Fringe', color: '#ec4899', description: 'Peripheral area' }
];

export default function HollywoodMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // For now, we'll create a simple visual representation
    // In a full implementation, you'd integrate with Leaflet or Google Maps
    if (mapRef.current) {
      // Clear any existing content
      mapRef.current.innerHTML = '';
      
      // Create a simple grid representation
      const mapContainer = document.createElement('div');
      mapContainer.className = 'relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden';
      
      // Add districts as colored rectangles in a grid pattern
      const gridPositions = [
        { district: '647', x: '10%', y: '10%', w: '35%', h: '35%' },
        { district: '645', x: '55%', y: '10%', w: '35%', h: '35%' },
        { district: '663', x: '10%', y: '55%', w: '35%', h: '35%' },
        { district: '646', x: '55%', y: '55%', w: '35%', h: '35%' },
        { district: '666', x: '25%', y: '32.5%', w: '25%', h: '25%' },
        { district: '656', x: '60%', y: '75%', w: '30%', h: '20%' },
        { district: '676', x: '10%', y: '75%', w: '30%', h: '20%' }
      ];

      gridPositions.forEach(pos => {
        const district = hollywoodDistricts.find(d => d.id === pos.district);
        if (district) {
          const element = document.createElement('div');
          element.className = 'absolute border-2 border-white rounded cursor-pointer transition-all duration-200 hover:scale-105 hover:z-10';
          element.style.left = pos.x;
          element.style.top = pos.y;
          element.style.width = pos.w;
          element.style.height = pos.h;
          element.style.backgroundColor = district.color;
          element.style.opacity = '0.8';
          
          // Add label
          const label = document.createElement('div');
          label.className = 'absolute inset-0 flex items-center justify-center text-white font-bold text-xs text-center p-1';
          label.innerHTML = `<div><div>${district.id}</div><div class="text-xs font-normal">${district.name}</div></div>`;
          element.appendChild(label);
          
          // Add tooltip on hover
          element.title = `District ${district.id}: ${district.name} - ${district.description}`;
          
          mapContainer.appendChild(element);
        }
      });

      // Add title
      const title = document.createElement('div');
      title.className = 'absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-sm font-semibold text-gray-800';
      title.textContent = 'Hollywood LAPD Reporting Districts';
      mapContainer.appendChild(title);

      mapRef.current.appendChild(mapContainer);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div ref={mapRef} className="w-full"></div>
      
      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Districts Coverage</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {hollywoodDistricts.map(district => (
            <div key={district.id} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: district.color }}
              ></div>
              <span className="font-medium">{district.id}</span>
              <span className="text-gray-600">{district.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500">
          All districts are within the Hollywood area (Area 6) of the LAPD
        </div>
      </div>
    </div>
  );
}
