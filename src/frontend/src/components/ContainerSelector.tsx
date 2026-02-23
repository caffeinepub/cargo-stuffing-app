import { ContainerTypeId } from '../types/container';
import { CONTAINER_TYPES } from '../data/containerTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface ContainerSelectorProps {
  selectedContainerId: ContainerTypeId;
  onSelect: (containerId: ContainerTypeId) => void;
}

export function ContainerSelector({ selectedContainerId, onSelect }: ContainerSelectorProps) {
  // Defensive check: ensure we have containers to display
  if (!CONTAINER_TYPES || CONTAINER_TYPES.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No container types available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-cargo-accent" />
        <h2 className="text-lg font-semibold">Select Container Type</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CONTAINER_TYPES.map((container) => (
          <Card
            key={container.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedContainerId === container.id
                ? 'border-cargo-accent border-2 bg-cargo-accent/5'
                : 'border-border hover:border-cargo-accent/50'
            }`}
            onClick={() => onSelect(container.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{container.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Length:</span>
                  <span className="font-medium text-foreground">{container.length}m</span>
                </div>
                <div className="flex justify-between">
                  <span>Width:</span>
                  <span className="font-medium text-foreground">{container.width}m</span>
                </div>
                <div className="flex justify-between">
                  <span>Height:</span>
                  <span className="font-medium text-foreground">{container.height}m</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border mt-2">
                  <span>Volume:</span>
                  <span className="font-semibold text-foreground">
                    {(container.length * container.width * container.height).toFixed(2)}m³
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
