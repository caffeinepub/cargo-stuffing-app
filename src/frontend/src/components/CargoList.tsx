// List component displaying all added cargo items with drag-to-place functionality
import { CargoItem } from '../types/cargo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Package, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CargoListProps {
  cargoItems: CargoItem[];
  onDeleteCargo: (id: string) => void;
  onDragStart?: (item: CargoItem) => void;
  onDragEnd?: () => void;
}

export function CargoList({ cargoItems, onDeleteCargo, onDragStart, onDragEnd }: CargoListProps) {
  const handleDragStart = (item: CargoItem) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('cargoItemId', item.id);
    if (onDragStart) {
      onDragStart(item);
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  if (cargoItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cargo Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No cargo items added yet</p>
            <p className="text-sm mt-1">Add items using the form above</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const placedCount = cargoItems.filter(item => item.isPlaced).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Cargo Items ({cargoItems.length})</CardTitle>
          <Badge variant="outline" className="text-sm">
            {placedCount} of {cargoItems.length} placed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead className="text-right">Weight</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargoItems.map((item) => (
                <TableRow
                  key={item.id}
                  draggable={!item.isPlaced}
                  onDragStart={handleDragStart(item)}
                  onDragEnd={handleDragEnd}
                  className={!item.isPlaced ? 'cursor-grab active:cursor-grabbing hover:bg-muted/50' : ''}
                >
                  <TableCell>
                    {item.isPlaced ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.name}
                    {!item.isPlaced && (
                      <span className="ml-2 text-xs text-muted-foreground">(drag to place)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.length} × {item.width} × {item.height} {item.unit}
                  </TableCell>
                  <TableCell className="text-right">{item.weight} kg</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteCargo(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {placedCount < cargoItems.length && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            💡 Drag unplaced items into the 3D view to position them in the container
          </p>
        )}
      </CardContent>
    </Card>
  );
}
