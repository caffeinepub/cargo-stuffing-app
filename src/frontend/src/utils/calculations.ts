// Utility functions for cargo load calculations
import { CargoItem } from '../types/cargo';
import { ContainerType } from '../types/container';

export function calculateCargoVolume(item: CargoItem): number {
  // Defensive checks
  if (!item || typeof item.length !== 'number' || typeof item.width !== 'number' || typeof item.height !== 'number') {
    console.warn('Invalid item dimensions:', item);
    return 0;
  }

  const lengthInMeters = item.unit === 'cm' ? item.length / 100 : item.length;
  const widthInMeters = item.unit === 'cm' ? item.width / 100 : item.width;
  const heightInMeters = item.unit === 'cm' ? item.height / 100 : item.height;
  const quantity = item.quantity || 1;
  
  const volume = lengthInMeters * widthInMeters * heightInMeters * quantity;
  
  return volume;
}

export function calculateTotalCargoVolume(items: CargoItem[]): number {
  if (!Array.isArray(items)) {
    console.warn('calculateTotalCargoVolume: items is not an array', items);
    return 0;
  }
  
  const total = items.reduce((total, item) => {
    const volume = calculateCargoVolume(item);
    return total + volume;
  }, 0);
  
  console.log('Total cargo volume calculated:', total, 'from', items.length, 'items');
  return total;
}

export function calculateContainerVolume(container: ContainerType): number {
  if (!container) {
    console.warn('calculateContainerVolume: container is null or undefined');
    return 0;
  }
  
  const volume = container.length * container.width * container.height;
  console.log('Container volume:', volume, 'for', container.id);
  return volume;
}

export function calculateUtilization(cargoVolume: number, containerVolume: number): number {
  if (containerVolume === 0) {
    console.warn('calculateUtilization: containerVolume is 0');
    return 0;
  }
  
  const utilization = (cargoVolume / containerVolume) * 100;
  console.log('Utilization:', utilization.toFixed(1) + '%', '(', cargoVolume.toFixed(2), '/', containerVolume.toFixed(2), ')');
  return utilization;
}

export function calculateTotalWeight(items: CargoItem[]): number {
  if (!Array.isArray(items)) {
    console.warn('calculateTotalWeight: items is not an array', items);
    return 0;
  }
  
  const total = items.reduce((total, item) => {
    const weight = (item.weight || 0) * (item.quantity || 1);
    return total + weight;
  }, 0);
  
  console.log('Total weight calculated:', total, 'kg from', items.length, 'items');
  return total;
}

export function filterPlacedItems(items: CargoItem[]): CargoItem[] {
  if (!Array.isArray(items)) {
    console.warn('filterPlacedItems: items is not an array', items);
    return [];
  }
  
  const placed = items.filter(item => item.isPlaced === true);
  console.log('Filtered placed items:', placed.length, 'out of', items.length);
  return placed;
}
