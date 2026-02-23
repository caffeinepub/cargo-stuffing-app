// Utility functions for detecting and grouping cargo items into layers
import { CargoItem, Layer, getCargoItemDimensionsInMeters } from '../types/cargo';

// Threshold for grouping items into the same layer (in meters)
const LAYER_THRESHOLD = 0.01;

/**
 * Groups placed cargo items into layers based on their Y-coordinate position
 * @param items Array of cargo items (only placed items will be processed)
 * @returns Array of layers sorted from bottom to top
 */
export function detectLayers(items: CargoItem[]): Layer[] {
  if (!Array.isArray(items)) {
    console.warn('detectLayers: items is not an array', items);
    return [];
  }

  const placedItems = items.filter(item => item.isPlaced && item.position);
  
  console.log('detectLayers: processing', placedItems.length, 'placed items');
  
  if (placedItems.length === 0) {
    return [];
  }

  // Group items by their Y position (bottom of the box)
  const layers: Layer[] = [];

  placedItems.forEach(item => {
    if (!item.position) return;

    const itemY = item.position.y;
    
    // Find if this item belongs to an existing layer
    let foundLayer = layers.find(layer => 
      Math.abs(itemY - layer.minY) < LAYER_THRESHOLD
    );

    if (foundLayer) {
      foundLayer.itemIds.push(item.id);
      foundLayer.maxY = Math.max(foundLayer.maxY, itemY);
    } else {
      // Create a new layer
      layers.push({
        layerNumber: 0, // Will be assigned after sorting
        minY: itemY,
        maxY: itemY,
        itemIds: [item.id]
      });
    }
  });

  // Sort layers from bottom to top and assign layer numbers
  layers.sort((a, b) => a.minY - b.minY);
  layers.forEach((layer, index) => {
    layer.layerNumber = index + 1;
  });

  console.log('detectLayers: found', layers.length, 'layers:', layers);

  return layers;
}

/**
 * Assigns sequential box numbers within each layer based on consistent ordering
 * @param items Array of cargo items
 * @param layers Array of detected layers
 * @returns Updated items with layerNumber and boxNumberInLayer properties
 */
export function assignBoxNumbers(items: CargoItem[], layers: Layer[]): CargoItem[] {
  if (!Array.isArray(items) || !Array.isArray(layers)) {
    console.warn('assignBoxNumbers: invalid input', { items, layers });
    return items;
  }

  const itemMap = new Map<string, { layerNumber: number; boxNumberInLayer: number }>();

  layers.forEach(layer => {
    // Get items in this layer
    const layerItems = items.filter(item => layer.itemIds.includes(item.id));
    
    console.log('assignBoxNumbers: layer', layer.layerNumber, 'has', layerItems.length, 'items');
    
    // Sort items within layer by X coordinate (left to right), then Z coordinate (front to back)
    layerItems.sort((a, b) => {
      if (!a.position || !b.position) return 0;
      
      const xDiff = a.position.x - b.position.x;
      if (Math.abs(xDiff) > 0.01) {
        return xDiff;
      }
      
      return a.position.z - b.position.z;
    });

    // Assign box numbers sequentially
    layerItems.forEach((item, index) => {
      itemMap.set(item.id, {
        layerNumber: layer.layerNumber,
        boxNumberInLayer: index + 1
      });
      console.log('Assigned box number:', item.id, '→', layer.layerNumber + '-' + (index + 1));
    });
  });

  // Return updated items with layer and box numbers
  return items.map(item => {
    const layerInfo = itemMap.get(item.id);
    if (layerInfo) {
      return {
        ...item,
        layerNumber: layerInfo.layerNumber,
        boxNumberInLayer: layerInfo.boxNumberInLayer
      };
    }
    return item;
  });
}

/**
 * Main function to calculate layer assignments and box numbers for all placed items
 * @param items Array of cargo items
 * @returns Updated items with layerNumber and boxNumberInLayer properties
 */
export function calculateLayerAssignments(items: CargoItem[]): CargoItem[] {
  console.log('calculateLayerAssignments: starting with', items?.length || 0, 'items');
  
  if (!Array.isArray(items)) {
    console.warn('calculateLayerAssignments: items is not an array', items);
    return [];
  }

  const layers = detectLayers(items);
  const result = assignBoxNumbers(items, layers);
  
  console.log('calculateLayerAssignments: completed, enriched', result.filter(i => i.layerNumber).length, 'items');
  
  return result;
}

/**
 * Gets layer summary data for display
 * @param items Array of cargo items with layer assignments
 * @returns Array of layer summaries with box counts
 */
export function getLayerSummary(items: CargoItem[]): { layerNumber: number; boxCount: number }[] {
  if (!Array.isArray(items)) {
    console.warn('getLayerSummary: items is not an array', items);
    return [];
  }

  const layers = detectLayers(items);
  
  const summary = layers.map(layer => ({
    layerNumber: layer.layerNumber,
    boxCount: layer.itemIds.length
  }));

  console.log('getLayerSummary:', summary);
  
  return summary;
}
