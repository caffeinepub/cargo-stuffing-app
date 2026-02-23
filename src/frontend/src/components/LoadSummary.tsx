// Summary component showing load calculations and utilization for placed items only
import { CargoItem } from '../types/cargo';
import { ContainerType } from '../types/container';
import {
  calculateTotalCargoVolume,
  calculateContainerVolume,
  calculateUtilization,
  calculateTotalWeight
} from '../utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Package, Weight, Box } from 'lucide-react';
import { useEffect } from 'react';

interface LoadSummaryProps {
  containerType: ContainerType;
  cargoItems: CargoItem[];
}

export function LoadSummary({ containerType, cargoItems }: LoadSummaryProps) {
  // Defensive check: ensure cargoItems is an array
  const safeCargoItems = Array.isArray(cargoItems) ? cargoItems : [];
  
  // Filter to only placed items
  const placedItems = safeCargoItems.filter(item => item.isPlaced === true);
  
  // Debug logging
  useEffect(() => {
    console.log('=== LoadSummary Update ===');
    console.log('Total cargo items received:', safeCargoItems.length);
    console.log('Placed items:', placedItems.length);
    console.log('Container type:', containerType?.id);
  }, [safeCargoItems, placedItems.length, containerType]);

  // Defensive calculations with fallbacks
  let totalCargoVolume = 0;
  let containerVolume = 0;
  let utilization = 0;
  let totalWeight = 0;

  try {
    totalCargoVolume = calculateTotalCargoVolume(placedItems);
    containerVolume = calculateContainerVolume(containerType);
    utilization = calculateUtilization(totalCargoVolume, containerVolume);
    totalWeight = calculateTotalWeight(placedItems);

    console.log('LoadSummary calculations:', {
      totalCargoVolume: totalCargoVolume.toFixed(2),
      containerVolume: containerVolume.toFixed(2),
      utilization: utilization.toFixed(1),
      totalWeight: totalWeight.toFixed(1)
    });
  } catch (error) {
    console.error('Error calculating load summary:', error);
  }

  const getUtilizationColor = (percent: number) => {
    if (percent > 100) return 'text-destructive';
    if (percent > 90) return 'text-yellow-600';
    if (percent > 70) return 'text-cargo-accent';
    return 'text-green-600';
  };

  const getProgressClassName = (percent: number) => {
    if (percent > 100) return '[&>div]:bg-destructive';
    if (percent > 90) return '[&>div]:bg-yellow-600';
    if (percent > 70) return '[&>div]:bg-cargo-accent';
    return '[&>div]:bg-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cargo-accent" />
          Load Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Volume Utilization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Volume Utilization</span>
            </div>
            <span className={`text-2xl font-bold ${getUtilizationColor(utilization)}`}>
              {utilization.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={Math.min(utilization, 100)} 
            className={`h-3 ${getProgressClassName(utilization)}`}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Placed: {totalCargoVolume.toFixed(2)}m³</span>
            <span>Container: {containerVolume.toFixed(2)}m³</span>
          </div>
          {utilization > 100 && (
            <p className="text-sm text-destructive font-medium">
              ⚠️ Warning: Placed cargo volume exceeds container capacity
            </p>
          )}
        </div>

        {/* Total Weight */}
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Weight (Placed)</span>
            </div>
            <span className="text-xl font-bold">{totalWeight.toFixed(1)} kg</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {(totalWeight / 1000).toFixed(2)} metric tons
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Box className="h-3 w-3" />
              Placed Items
            </p>
            <p className="text-lg font-semibold">
              {placedItems.length} / {safeCargoItems.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Placed Units</p>
            <p className="text-lg font-semibold">
              {placedItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Units</p>
            <p className="text-lg font-semibold">
              {safeCargoItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
