import { useRef, useState, useEffect, useMemo, Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { ContainerType } from '../types/container';
import { CargoItem, Position3D, getCargoItemDimensionsInMeters } from '../types/cargo';
import { CargoBox3D } from './CargoBox3D';
import { Canvas3DFallback } from './Canvas3DFallback';
import { LayerSummary } from './LayerSummary';
import { isValidPlacement, snapToGrid } from '../utils/placement';
import { generateCargoColor } from '../utils/colors';
import { calculateLayerAssignments, getLayerSummary } from '../utils/layering';
import * as THREE from 'three';

interface Container3DViewProps {
  containerType: ContainerType;
  cargoItems: CargoItem[];
  onPlaceItem?: (itemId: string, position: Position3D) => void;
  onSelectItem?: (itemId: string | null) => void;
  selectedItemId?: string | null;
  onRemoveItem?: (itemId: string) => void;
  draggedItem: CargoItem | null;
}

function ContainerMesh({ containerType }: { containerType: ContainerType }) {
  const { length, width, height } = containerType;

  useEffect(() => {
    console.log('ContainerMesh rendering with dimensions:', { length, width, height });
  }, [length, width, height]);

  return (
    <group>
      {/* Container wireframe */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[length, height, width]} />
        <meshBasicMaterial color="#ff6b35" wireframe />
      </mesh>
      
      {/* Container edges for better visibility */}
      <lineSegments position={[0, height / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(length, height, width)]} />
        <lineBasicMaterial color="#ff6b35" linewidth={2} />
      </lineSegments>

      {/* Floor grid */}
      <Grid
        args={[length * 1.5, width * 1.5]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#9ca3af"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
        position={[0, 0, 0]}
      />
    </group>
  );
}

function DragPreview({
  item,
  position,
  isValid,
}: {
  item: CargoItem;
  position: Position3D;
  isValid: boolean;
}) {
  const dims = getCargoItemDimensionsInMeters(item);

  return (
    <group position={[position.x, position.y + dims.height / 2, position.z]}>
      <mesh>
        <boxGeometry args={[dims.length, dims.height, dims.width]} />
        <meshStandardMaterial
          color={isValid ? '#10b981' : '#ef4444'}
          opacity={0.5}
          transparent
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(dims.length, dims.height, dims.width)]} />
        <lineBasicMaterial color={isValid ? '#10b981' : '#ef4444'} linewidth={2} />
      </lineSegments>
    </group>
  );
}

function InteractiveScene({
  containerType,
  cargoItems,
  onSelectItem,
  selectedItemId,
  onRemoveItem,
  previewPosition,
  isValidPosition,
  draggedItem,
  onSceneReady,
}: Container3DViewProps & {
  previewPosition: Position3D | null;
  isValidPosition: boolean;
  onSceneReady: () => void;
}) {
  const { gl } = useThree();

  useEffect(() => {
    // Log successful initialization
    console.log('3D Scene initialized successfully', {
      renderer: gl.info.render,
      webglVersion: gl.capabilities.isWebGL2 ? 'WebGL2' : 'WebGL1',
    });
    onSceneReady();
  }, [gl, onSceneReady]);

  // Debug placed items
  const placedItems = cargoItems.filter((item) => item.isPlaced && item.position);
  
  useEffect(() => {
    console.log('=== Container3DView InteractiveScene Update ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Total cargo items received:', cargoItems.length);
    console.log('Items with isPlaced=true:', cargoItems.filter(i => i.isPlaced).length);
    console.log('Items with position defined:', cargoItems.filter(i => i.position).length);
    console.log('Placed items (isPlaced && position):', placedItems.length);
    console.log('Placed items details:', placedItems.map(item => ({
      id: item.id,
      name: item.name,
      position: item.position,
      layerNumber: item.layerNumber,
      boxNumberInLayer: item.boxNumberInLayer
    })));
    console.log('Will render', placedItems.length, 'CargoBox3D components');
  }, [cargoItems, placedItems.length]);

  const handleBackgroundClick = () => {
    if (onSelectItem) {
      onSelectItem(null);
    }
  };

  const handleCargoContextMenu = (item: CargoItem, event: any) => {
    event.nativeEvent.preventDefault();
    if (onRemoveItem) {
      onRemoveItem(item.id);
    }
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />
      
      <group onClick={handleBackgroundClick}>
        <ContainerMesh containerType={containerType} />
      </group>

      {/* Render placed cargo items */}
      {placedItems.map((item) => {
        console.log('Rendering CargoBox3D for item:', item.id, item.name, 'at position:', item.position);
        return (
          <CargoBox3D
            key={item.id}
            item={item}
            isSelected={item.id === selectedItemId}
            onSelect={(item) => onSelectItem && onSelectItem(item.id)}
            onContextMenu={handleCargoContextMenu}
          />
        );
      })}

      {/* Drag preview */}
      {draggedItem && previewPosition && (
        <DragPreview item={draggedItem} position={previewPosition} isValid={isValidPosition} />
      )}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
      />
    </>
  );
}

// Error boundary specifically for Canvas
class Canvas3DErrorBoundary extends Component<
  { children: ReactNode; onError: (error: string) => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: (error: string) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Canvas3D error:', error, errorInfo);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to initialize 3D view';
    
    if (error.message.includes('WebGL')) {
      errorMessage = 'WebGL is not supported or enabled in your browser. Please enable hardware acceleration or try a different browser.';
    } else if (error.message.includes('context')) {
      errorMessage = 'Failed to create WebGL context. Your browser may not support 3D graphics.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    this.props.onError(errorMessage);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export function Container3DView({
  containerType,
  cargoItems,
  onPlaceItem,
  onSelectItem,
  selectedItemId,
  onRemoveItem,
  draggedItem,
}: Container3DViewProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [previewPosition, setPreviewPosition] = useState<Position3D | null>(null);
  const [isValidPosition, setIsValidPosition] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging for prop changes
  useEffect(() => {
    console.log('=== Container3DView Props Update ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Container type:', containerType.id);
    console.log('Total cargo items:', cargoItems.length);
    console.log('Dragged item:', draggedItem ? `${draggedItem.id} (${draggedItem.name})` : 'none');
    console.log('Cargo items breakdown:', {
      total: cargoItems.length,
      placed: cargoItems.filter(i => i.isPlaced).length,
      withPosition: cargoItems.filter(i => i.position).length,
      unplaced: cargoItems.filter(i => !i.isPlaced).length
    });
  }, [containerType, cargoItems, draggedItem]);

  // Calculate layer assignments for placed items
  const itemsWithLayers = useMemo(() => {
    const placedItems = cargoItems.filter((item) => item.isPlaced && item.position);
    console.log('Calculating layers for', placedItems.length, 'placed items');
    return calculateLayerAssignments(placedItems);
  }, [cargoItems]);

  const layerSummary = useMemo(() => {
    const summary = getLayerSummary(itemsWithLayers);
    console.log('Layer summary:', summary);
    return summary;
  }, [itemsWithLayers]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!draggedItem || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const dims = getCargoItemDimensionsInMeters(draggedItem);
    const worldX = x * (containerType.length / 2);
    const worldZ = y * (containerType.width / 2);

    // Snap each coordinate individually
    const snappedPos: Position3D = {
      x: snapToGrid(worldX, 0.1),
      y: 0,
      z: snapToGrid(worldZ, 0.1)
    };
    
    setPreviewPosition(snappedPos);

    const placedItems = cargoItems.filter((item) => item.isPlaced && item.position);
    const valid = isValidPlacement(draggedItem, snappedPos, containerType, placedItems);
    setIsValidPosition(valid);
  };

  const handleClick = () => {
    if (draggedItem && previewPosition && isValidPosition && onPlaceItem) {
      console.log('=== Placing Item via Click ===');
      console.log('Item:', draggedItem.id, draggedItem.name);
      console.log('Position:', previewPosition);
      onPlaceItem(draggedItem.id, previewPosition);
      setPreviewPosition(null);
    }
  };

  const handleSceneReady = () => {
    console.log('3D Scene ready, hiding loading state');
    setIsLoading(false);
  };

  const handleError = (errorMessage: string) => {
    console.error('3D View error:', errorMessage);
    setError(errorMessage);
    setIsLoading(false);
  };

  if (error) {
    return <Canvas3DFallback error={error} />;
  }

  return (
    <div className="relative">
      <div
        ref={canvasRef}
        className="w-full h-[600px] bg-background border border-border rounded-lg overflow-hidden"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        {isLoading && <Canvas3DFallback />}
        <Canvas3DErrorBoundary onError={handleError}>
          <Suspense fallback={null}>
            <Canvas
              camera={{ position: [15, 10, 15], fov: 50 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: 'transparent' }}
            >
              <InteractiveScene
                containerType={containerType}
                cargoItems={itemsWithLayers}
                onSelectItem={onSelectItem}
                selectedItemId={selectedItemId}
                onRemoveItem={onRemoveItem}
                previewPosition={previewPosition}
                isValidPosition={isValidPosition}
                draggedItem={draggedItem}
                onSceneReady={handleSceneReady}
              />
            </Canvas>
          </Suspense>
        </Canvas3DErrorBoundary>
      </div>

      {/* Layer Summary Overlay */}
      {layerSummary.length > 0 && (
        <div className="absolute top-4 right-4">
          <LayerSummary layers={layerSummary} />
        </div>
      )}
    </div>
  );
}
