// Utility functions for validating cargo placement in 3D container
import { CargoItem, Position3D, getCargoItemDimensionsInMeters } from '../types/cargo';
import { ContainerType } from '../types/container';

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export function getItemBoundingBox(item: CargoItem): BoundingBox | null {
  if (!item.position) return null;
  
  const dims = getCargoItemDimensionsInMeters(item);
  
  return {
    minX: item.position.x - dims.length / 2,
    maxX: item.position.x + dims.length / 2,
    minY: item.position.y,
    maxY: item.position.y + dims.height,
    minZ: item.position.z - dims.width / 2,
    maxZ: item.position.z + dims.width / 2,
  };
}

export function checkBoundingBoxCollision(box1: BoundingBox, box2: BoundingBox): boolean {
  return !(
    box1.maxX <= box2.minX ||
    box1.minX >= box2.maxX ||
    box1.maxY <= box2.minY ||
    box1.minY >= box2.maxY ||
    box1.maxZ <= box2.minZ ||
    box1.minZ >= box2.maxZ
  );
}

export function isWithinContainerBounds(
  item: CargoItem,
  position: Position3D,
  container: ContainerType
): boolean {
  const dims = getCargoItemDimensionsInMeters(item);
  
  const minX = position.x - dims.length / 2;
  const maxX = position.x + dims.length / 2;
  const minY = position.y;
  const maxY = position.y + dims.height;
  const minZ = position.z - dims.width / 2;
  const maxZ = position.z + dims.width / 2;
  
  return (
    minX >= -container.length / 2 &&
    maxX <= container.length / 2 &&
    minY >= 0 &&
    maxY <= container.height &&
    minZ >= -container.width / 2 &&
    maxZ <= container.width / 2
  );
}

export function checkCollisionWithPlacedItems(
  item: CargoItem,
  position: Position3D,
  placedItems: CargoItem[]
): boolean {
  const testItem = { ...item, position };
  const testBox = getItemBoundingBox(testItem);
  
  if (!testBox) return false;
  
  for (const placedItem of placedItems) {
    if (placedItem.id === item.id) continue;
    if (!placedItem.isPlaced) continue;
    
    const placedBox = getItemBoundingBox(placedItem);
    if (!placedBox) continue;
    
    if (checkBoundingBoxCollision(testBox, placedBox)) {
      return true;
    }
  }
  
  return false;
}

export function isValidPlacement(
  item: CargoItem,
  position: Position3D,
  container: ContainerType,
  placedItems: CargoItem[]
): boolean {
  return (
    isWithinContainerBounds(item, position, container) &&
    !checkCollisionWithPlacedItems(item, position, placedItems)
  );
}

export function snapToGrid(value: number, gridSize: number = 0.1): number {
  return Math.round(value / gridSize) * gridSize;
}
