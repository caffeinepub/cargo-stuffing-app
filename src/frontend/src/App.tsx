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
    console.log('Total cargo items:', cargoItems.length);
    console.log('Placed items:', cargoItems.filter(item => item.isPlaced).length);
    console.log('Cargo items:', cargoItems.map(item => ({
      id: item.id,
      name: item.name,
      isPlaced: item.isPlaced,
      position: item.position
    })));
  }, [cargoItems]);

  const handleAddCargo = (cargo: Omit<CargoItem, 'id'>) => {
    const newItem: CargoItem = {
      ...cargo,
      id: `cargo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isPlaced: false,
    };
    console.log('Adding new cargo item:', newItem);
    setCargoItems((prev) => [...prev, newItem]);
  };

  const handleDeleteCargo = (id: string) => {
    console.log('Deleting cargo item:', id);
    setCargoItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  };

  const handlePlaceItem = (itemId: string, position: Position3D) => {
    console.log('Placing item:', itemId, 'at position:', position);
    setCargoItems((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId
          ? { ...item, position, isPlaced: true }
          : item
      );
      console.log('Updated cargo items after placement:', updated.filter(i => i.isPlaced).length, 'placed');
      return updated;
    });
    setDraggedItem(null);
  };

  const handleRemoveItem = (itemId: string) => {
    console.log('Removing item from container:', itemId);
    setCargoItems((prev) =>
      prev.map((item) =>
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
    console.log('Drag started for item:', item.id, item.name);
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    console.log('Drag ended');
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

  console.log('Rendering App with container:', selectedContainer.id);

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
