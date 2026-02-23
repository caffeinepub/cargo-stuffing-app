import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';
import { useEffect } from 'react';

interface LayerSummaryProps {
  layers: { layerNumber: number; boxCount: number }[];
}

export function LayerSummary({ layers }: LayerSummaryProps) {
  // Debug logging
  useEffect(() => {
    console.log('LayerSummary rendering with layers:', layers);
  }, [layers]);

  // Defensive check: ensure layers is an array
  if (!layers || !Array.isArray(layers) || layers.length === 0) {
    console.log('LayerSummary: no layers to display');
    return null;
  }

  return (
    <Card className="absolute top-4 right-4 w-48 shadow-lg z-10 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="h-4 w-4 text-cargo-accent" />
          Layer Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {layers.map(layer => (
          <div 
            key={layer.layerNumber}
            className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0"
          >
            <span className="font-medium">Layer {layer.layerNumber}</span>
            <span className="text-muted-foreground">
              {layer.boxCount} {layer.boxCount === 1 ? 'box' : 'boxes'}
            </span>
          </div>
        ))}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Total</span>
            <span className="text-cargo-accent">
              {layers.reduce((sum, layer) => sum + layer.boxCount, 0)} boxes
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
