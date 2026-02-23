import { useRef, useState, useEffect } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { CargoItem, getCargoItemDimensionsInMeters } from '../types/cargo';
import { generateCargoColor } from '../utils/colors';
import { CargoBoxLabel } from './CargoBoxLabel';
import * as THREE from 'three';

interface CargoBox3DProps {
  item: CargoItem;
  isSelected?: boolean;
  onSelect?: (item: CargoItem) => void;
  onContextMenu?: (item: CargoItem, event: ThreeEvent<MouseEvent>) => void;
}

export function CargoBox3D({ item, isSelected = false, onSelect, onContextMenu }: CargoBox3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('CargoBox3D rendering:', {
      id: item.id,
      name: item.name,
      position: item.position,
      layerNumber: item.layerNumber,
      boxNumberInLayer: item.boxNumberInLayer
    });
  }, [item]);

  // Defensive checks
  if (!item) {
    console.error('CargoBox3D: item is null or undefined');
    return null;
  }

  if (!item.position) {
    console.warn('CargoBox3D: item has no position', item.id);
    return null;
  }

  let dims;
  try {
    dims = getCargoItemDimensionsInMeters(item);
    console.log('CargoBox3D dimensions:', dims, 'for item', item.id);
  } catch (error) {
    console.error('CargoBox3D: failed to get dimensions for item', item.id, error);
    return null;
  }

  const color = generateCargoColor(item.id);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    console.log('CargoBox3D clicked:', item.id);
    if (onSelect) {
      onSelect(item);
    }
  };

  const handleContextMenu = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    console.log('CargoBox3D context menu:', item.id);
    if (onContextMenu) {
      onContextMenu(item, e);
    }
  };

  // Calculate label position at the top center of the box
  const labelPosition = {
    x: 0,
    y: dims.height / 2 + 0.2,
    z: 0
  };

  // Format label text as "Layer-Box"
  const labelText = item.layerNumber && item.boxNumberInLayer 
    ? `${item.layerNumber}-${item.boxNumberInLayer}`
    : '';

  console.log('CargoBox3D label text:', labelText, 'for item', item.id);

  return (
    <group position={[item.position.x, item.position.y + dims.height / 2, item.position.z]}>
      {/* Main box */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[dims.length, dims.height, dims.width]} />
        <meshStandardMaterial
          color={color}
          opacity={isSelected ? 0.9 : hovered ? 0.85 : 0.8}
          transparent
          emissive={isSelected ? color : hovered ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Box edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(dims.length, dims.height, dims.width)]} />
        <lineBasicMaterial
          color={isSelected ? '#ffffff' : hovered ? '#ffffff' : '#000000'}
          linewidth={isSelected ? 3 : 2}
          opacity={isSelected ? 1 : 0.5}
          transparent
        />
      </lineSegments>

      {/* Selection highlight */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[dims.length * 1.05, dims.height * 1.05, dims.width * 1.05]} />
          <meshBasicMaterial color="#ffffff" wireframe opacity={0.3} transparent />
        </mesh>
      )}

      {/* Box number label */}
      {labelText && (
        <CargoBoxLabel text={labelText} position={labelPosition} />
      )}
    </group>
  );
}
