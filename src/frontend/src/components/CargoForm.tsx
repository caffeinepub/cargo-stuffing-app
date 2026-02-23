// Form component for adding cargo items
import { useState } from 'react';
import { CargoItem, UnitType } from '../types/cargo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface CargoFormProps {
  onAddCargo: (cargo: Omit<CargoItem, 'id'>) => void;
}

export function CargoForm({ onAddCargo }: CargoFormProps) {
  const [name, setName] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [unit, setUnit] = useState<UnitType>('cm');
  const [weight, setWeight] = useState('');
  const [quantity, setQuantity] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lengthNum = parseFloat(length);
    const widthNum = parseFloat(width);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const quantityNum = parseInt(quantity);

    if (
      !name.trim() ||
      isNaN(lengthNum) ||
      isNaN(widthNum) ||
      isNaN(heightNum) ||
      isNaN(weightNum) ||
      isNaN(quantityNum) ||
      lengthNum <= 0 ||
      widthNum <= 0 ||
      heightNum <= 0 ||
      weightNum <= 0 ||
      quantityNum <= 0
    ) {
      return;
    }

    onAddCargo({
      name: name.trim(),
      length: lengthNum,
      width: widthNum,
      height: heightNum,
      unit,
      weight: weightNum,
      quantity: quantityNum
    });

    // Reset form
    setName('');
    setLength('');
    setWidth('');
    setHeight('');
    setWeight('');
    setQuantity('1');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Cargo Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pallet of boxes"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Input
                id="length"
                type="number"
                step="0.01"
                min="0.01"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                step="0.01"
                min="0.01"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                step="0.01"
                min="0.01"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={unit} onValueChange={(value) => setUnit(value as UnitType)}>
              <SelectTrigger id="unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">Centimeters (cm)</SelectItem>
                <SelectItem value="m">Meters (m)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-cargo-accent hover:bg-cargo-accent/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Cargo Item
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
