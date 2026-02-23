// Custom hook for managing drag preview state during cargo placement
import { useState } from 'react';
import { CargoItem, Position3D } from '../types/cargo';

export interface DragPreviewState {
  isActive: boolean;
  item: CargoItem | null;
  position: Position3D | null;
  isValid: boolean;
}

export function useDragPreview() {
  const [dragPreview, setDragPreview] = useState<DragPreviewState>({
    isActive: false,
    item: null,
    position: null,
    isValid: false,
  });

  const startDrag = (item: CargoItem) => {
    setDragPreview({
      isActive: true,
      item,
      position: null,
      isValid: false,
    });
  };

  const updateDragPosition = (position: Position3D, isValid: boolean) => {
    setDragPreview((prev) => ({
      ...prev,
      position,
      isValid,
    }));
  };

  const endDrag = () => {
    setDragPreview({
      isActive: false,
      item: null,
      position: null,
      isValid: false,
    });
  };

  return {
    dragPreview,
    startDrag,
    updateDragPosition,
    endDrag,
  };
}
