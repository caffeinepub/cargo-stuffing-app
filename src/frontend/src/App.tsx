import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ContainerSelector } from './components/ContainerSelector';
import { Container3DView } from './components/Container3DView';
import { CargoForm } from './components/CargoForm';
import { CargoList } from './components/CargoList';
import { LoadSummary } from './components/LoadSummary';
import { CONTAINER_TYPES } from './data/containerTypes';
import { ContainerTypeId } from './types/container';
import { CargoItem, Position3D } from './types/cargo';

function App() {
  const [selectedContainerId, setSelectedContainerId] = useState<ContainerTypeId>('20ft');
  const [cargoItems, setCargoItems] = useState<CargoItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<CargoItem | null>(null);

  // Defensive check: ensure selectedContainer is always valid
  const selectedContainer = CONTAINER_TYPES.find((c) => c.id === selectedContainerId) || CONTAINER_TYPES[0];

  // Debug logging for state changes
  useEffect(() => {
    console.log('=== App State Update ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Total cargo items:', cargoItems.length);
    console.log('Placed items:', cargoItems.filter(item => item.isPlaced).length);
    console.log('Cargo items details:', cargoItems.map(item => ({
      id: item.id,
      name: item.name,
      isPlaced: item.isPlaced,
      position: item.position,
      dimensions: `${item.length}x${item.width}x${item.height} ${item.unit}`,
      weight: item.weight,
      quantity: item.quantity
    })));
  }, [cargoItems]);

  const handleAddCargo = (cargo: Omit<CargoItem, 'id' | 'isPlaced' | 'position'>) => {
    // Create new item with unique ID and proper initialization
    const newItem: CargoItem = {
      ...cargo,
      id: `cargo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isPlaced: false,
      position: undefined, // Explicitly set position as undefined for unplaced items
    };
    
    console.log('=== Adding New Cargo Item ===');
    console.log('New item:', newItem);
    console.log('Current array length:', cargoItems.length);
    
    // Use functional update to ensure we get the latest state
    setCargoItems((prevItems) => {
      const updatedItems = [...prevItems, newItem];
      console.log('Updated array length:', updatedItems.length);
      console.log('Updated items:', updatedItems.map(i => ({ id: i.id, name: i.name, isPlaced: i.isPlaced })));
      return updatedItems;
    });
  };

  const handleDeleteCargo = (id: string) => {
    console.log('=== Deleting Cargo Item ===');
    console.log('Deleting item ID:', id);
    
    setCargoItems((prevItems) => {
      const filtered = prevItems.filter((item) => item.id !== id);
      console.log('Items after deletion:', filtered.length);
      return filtered;
    });
    
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  };

  const handlePlaceItem = (itemId: string, position: Position3D) => {
    console.log('=== Placing Item ===');
    console.log('Item ID:', itemId);
    console.log('Position:', position);
    
    setCargoItems((prevItems) => {
      const updated = prevItems.map((item) =>
        item.id === itemId
          ? { ...item, position, isPlaced: true }
          : item
      );
      
      const placedCount = updated.filter(i => i.isPlaced).length;
      console.log('Updated cargo items after placement. Placed count:', placedCount);
      console.log('Placed items:', updated.filter(i => i.isPlaced).map(i => ({ id: i.id, name: i.name, position: i.position })));
      
      return updated;
    });
    
    setDraggedItem(null);
  };

  const handleRemoveItem = (itemId: string) => {
    console.log('=== Removing Item from Container ===');
    console.log('Item ID:', itemId);
    
    setCargoItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? { ...item, position: undefined, isPlaced: false }
          : item
      )
    );
    
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    }
  };

  const handleDragStart = (item: CargoItem) => {
    console.log('=== Drag Started ===');
    console.log('Item:', item.id, item.name);
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    console.log('=== Drag Ended ===');
    setDraggedItem(null);
  };

  // Defensive check: ensure we have a valid container before rendering
  if (!selectedContainer) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading container data...</p>
        </div>
      </Layout>
    );
  }

  console.log('=== Rendering App ===');
  console.log('Container:', selectedContainer.id);
  console.log('Total items to render:', cargoItems.length);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Container Selection */}
        <section>
          <ContainerSelector
            selectedContainerId={selectedContainerId}
            onSelect={setSelectedContainerId}
          />
        </section>

        {/* 3D Visualization */}
        <section>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">3D Container View</h2>
              {draggedItem && (
                <p className="text-sm text-muted-foreground">
                  Move your cursor over the container to place <span className="font-medium">{draggedItem.name}</span>
                </p>
              )}
            </div>
            <Container3DView
              containerType={selectedContainer}
              cargoItems={cargoItems}
              onPlaceItem={handlePlaceItem}
              onSelectItem={setSelectedItemId}
              selectedItemId={selectedItemId}
              onRemoveItem={handleRemoveItem}
              draggedItem={draggedItem}
            />
            {selectedItemId && (
              <p className="text-sm text-muted-foreground text-center">
                💡 Right-click on the selected item to remove it from the container
              </p>
            )}
          </div>
        </section>

        {/* Cargo Management and Summary */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Cargo Form */}
          <div className="lg:col-span-1">
            <CargoForm onAddCargo={handleAddCargo} />
          </div>

          {/* Right Column: Load Summary */}
          <div className="lg:col-span-2 space-y-6">
            <LoadSummary containerType={selectedContainer} cargoItems={cargoItems} />
            <CargoList
              cargoItems={cargoItems}
              onDeleteCargo={handleDeleteCargo}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default App;
