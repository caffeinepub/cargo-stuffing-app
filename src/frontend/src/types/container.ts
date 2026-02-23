// Container type definitions for standard shipping containers
export type ContainerTypeId = '20ft' | '40ft' | '40ftHC';

export interface ContainerType {
  id: ContainerTypeId;
  name: string;
  length: number; // meters
  width: number; // meters
  height: number; // meters
  displayLabel: string;
}
