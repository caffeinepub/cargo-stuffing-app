import { useEffect } from 'react';
import { CargoItem, getCargoItemDimensionsInMeters } from '../types/cargo';
import { generateCargoColor } from '../utils/colors';
import { CargoBoxLabel } from './CargoBoxLabel';
import * as THREE from 'three';

interface CargoBox3DProps {
  item: CargoItem;
  isSelected: boolean;
  onSelect: (item: CargoItem) => void;
  onContextMenu: (item: CargoItem, event: any) => void;
}

export function CargoBox3D({ item, isSelected, onSelect, onContextMenu }: CargoBox3DProps) {
  const dims = getCargoItemDimensionsInMeters(item);
  const color = generateCargoColor(item.id);

  useEffect(() => {
    console.log('=== CargoBox3D Render ===');
    console.log('Item ID:', item.id);
    console.log('Item name:', item.name);
    console.log('Position:', item.position);
    console.log('Dimensions (meters):', dims);
    console.log('Layer:', item.layerNumber, 'Box:', item.boxNumberInLayer);
    console.log('Color:', color);
  }, [item.id, item.position, dims, color]);

  if (!item.position) {
    console.warn('CargoBox3D: Item has no position, skipping render:', item.id);
    return null;
  }

  const { x, y, z } = item.position;
  const { length, width, height } = dims;

  // Position the box so its bottom sits at y, not its center
  const boxCenterY = y + height / 2;

  const labelText = item.layerNumber && item.boxNumberInLayer 
    ? `${item.layerNumber}-${item.boxNumberInLayer}`
    : item.name;

  return (
    <group position={[x, boxCenterY, z]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item);
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
          onContextMenu(item, e);
        }}
      >
        <boxGeometry args={[length, height, width]} />
        <meshStandardMaterial
          color={color}
          opacity={isSelected ? 0.9 : 0.7}
          transparent
          emissive={isSelected ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      
      {/* Box edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(length, height, width)]} />
        <lineBasicMaterial color={isSelected ? '#ffffff' : '#000000'} linewidth={isSelected ? 2 : 1} />
      </lineSegments>

      {/* Label */}
      <CargoBoxLabel 
        text={labelText} 
        position={{ x: 0, y: height / 2 + 0.1, z: 0 }} 
      />
    </group>
  );
}
