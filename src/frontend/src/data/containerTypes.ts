// Standard shipping container specifications
import { ContainerType } from '../types/container';

export const CONTAINER_TYPES: ContainerType[] = [
  {
    id: '20ft',
    name: '20ft Standard',
    length: 5.9,
    width: 2.35,
    height: 2.39,
    displayLabel: '20ft Container (5.9m × 2.35m × 2.39m)'
  },
  {
    id: '40ft',
    name: '40ft Standard',
    length: 12.03,
    width: 2.35,
    height: 2.39,
    displayLabel: '40ft Container (12.03m × 2.35m × 2.39m)'
  },
  {
    id: '40ftHC',
    name: '40ft High Cube',
    length: 12.03,
    width: 2.35,
    height: 2.69,
    displayLabel: '40ft High Cube (12.03m × 2.35m × 2.69m)'
  }
];
