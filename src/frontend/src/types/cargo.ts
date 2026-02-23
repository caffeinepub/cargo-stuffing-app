// Cargo item definitions for load planning with 3D placement support
export type UnitType = 'cm' | 'm';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface CargoItem {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  unit: UnitType;
  weight: number; // kg
  quantity: number;
  position?: Position3D; // 3D placement position in meters
  isPlaced?: boolean; // Whether item is placed in 3D view
  layerNumber?: number; // Layer number (1-based, from bottom to top)
  boxNumberInLayer?: number; // Sequential box number within the layer
}

export interface Layer {
  layerNumber: number;
  minY: number;
  maxY: number;
  itemIds: string[];
}

export function calculateCargoItemVolume(item: CargoItem): number {
  const lengthInMeters = item.unit === 'cm' ? item.length / 100 : item.length;
  const widthInMeters = item.unit === 'cm' ? item.width / 100 : item.width;
  const heightInMeters = item.unit === 'cm' ? item.height / 100 : item.height;
  return lengthInMeters * widthInMeters * heightInMeters * item.quantity;
}

export function getCargoItemDimensionsInMeters(item: CargoItem): { length: number; width: number; height: number } {
  return {
    length: item.unit === 'cm' ? item.length / 100 : item.length,
    width: item.unit === 'cm' ? item.width / 100 : item.width,
    height: item.unit === 'cm' ? item.height / 100 : item.height,
  };
}
