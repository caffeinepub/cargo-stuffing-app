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
  const { gl, scene, camera } = useThree();

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
    console.log('=== InteractiveScene Update ===');
    console.log('Total cargo items:', cargoItems.length);
    console.log('Placed items with position:', placedItems.length);
    console.log('Placed items details:', placedItems.map(item => ({
      id: item.id,
      name: item.name,
      position: item.position,
      layerNumber: item.layerNumber,
      boxNumberInLayer: item.boxNumberInLayer
    })));
  }, [cargoItems.length, placedItems.length]);

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
        console.log('Rendering CargoBox3D for item:', item.id, item.name);
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

export function Container3DView(props: Container3DViewProps) {
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewPosition, setPreviewPosition] = useState<Position3D | null>(null);
  const [isValidPosition, setIsValidPosition] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug props
  useEffect(() => {
    console.log('=== Container3DView Props Update ===');
    console.log('Container type:', props.containerType?.id);
    console.log('Total cargo items:', props.cargoItems?.length || 0);
    console.log('Dragged item:', props.draggedItem?.name || 'none');
  }, [props.containerType, props.cargoItems, props.draggedItem]);

  // Calculate layer assignments and box numbers for all placed items
  const enrichedCargoItems = useMemo(() => {
    try {
      console.log('Calculating layer assignments for', props.cargoItems.length, 'items');
      const enriched = calculateLayerAssignments(props.cargoItems);
      console.log('Enriched items:', enriched.filter(i => i.isPlaced).map(i => ({
        id: i.id,
        name: i.name,
        layerNumber: i.layerNumber,
        boxNumberInLayer: i.boxNumberInLayer
      })));
      return enriched;
    } catch (error) {
      console.error('Error calculating layer assignments:', error);
      return props.cargoItems;
    }
  }, [props.cargoItems]);

  // Calculate layer summary
  const layerSummary = useMemo(() => {
    try {
      const summary = getLayerSummary(enrichedCargoItems);
      console.log('Layer summary:', summary);
      return summary;
    } catch (error) {
      console.error('Error calculating layer summary:', error);
      return [];
    }
  }, [enrichedCargoItems]);

  // Set timeout for loading state
  useEffect(() => {
    console.log('Container3DView mounting, starting initialization...');
    
    loadingTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.error('3D Canvas initialization timeout');
        setCanvasError('3D view initialization timed out. Please refresh the page or try a different browser.');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const handleSceneReady = () => {
    console.log('Scene ready, clearing loading state');
    setIsLoading(false);
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  };

  // Defensive check: ensure containerType is valid
  if (!props.containerType) {
    console.error('Container3DView: containerType is null or undefined');
    return (
      <div className="w-full h-[500px] bg-card rounded-lg border border-border overflow-hidden">
        <Canvas3DFallback isLoading={false} error="Container type not available" />
      </div>
    );
  }

  if (canvasError) {
    return (
      <div className="w-full h-[500px] bg-card rounded-lg border border-border overflow-hidden">
        <Canvas3DFallback isLoading={false} error={canvasError} />
      </div>
    );
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!props.draggedItem) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Calculate position based on pointer - simplified approach
    const dims = getCargoItemDimensionsInMeters(props.draggedItem);
    const containerLength = props.containerType.length;
    const containerWidth = props.containerType.width;

    // Map normalized coordinates to container space
    const posX = (x * containerLength) / 2;
    const posZ = (y * containerWidth) / 2;

    // Snap each coordinate to grid
    const snappedPos: Position3D = {
      x: snapToGrid(posX, 0.1),
      y: 0,
      z: snapToGrid(posZ, 0.1)
    };
    
    setPreviewPosition(snappedPos);

    // Create a temporary item with the preview position for validation
    const tempItem: CargoItem = {
      ...props.draggedItem,
      position: snappedPos
    };

    // Validate placement
    const valid = isValidPlacement(
      tempItem,
      snappedPos,
      props.containerType,
      enrichedCargoItems.filter((item) => item.isPlaced && item.position)
    );
    setIsValidPosition(valid);
  };

  const handleClick = () => {
    if (props.draggedItem && previewPosition && isValidPosition && props.onPlaceItem) {
      console.log('Placing item via click:', props.draggedItem.id, 'at', previewPosition);
      props.onPlaceItem(props.draggedItem.id, previewPosition);
      setPreviewPosition(null);
    }
  };

  return (
    <div className="relative w-full h-[500px] bg-card rounded-lg border border-border overflow-hidden">
      {/* Layer Summary Overlay */}
      {layerSummary.length > 0 && <LayerSummary layers={layerSummary} />}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Canvas3DFallback isLoading={true} />
        </div>
      )}

      <Canvas3DErrorBoundary onError={setCanvasError}>
        <div
          className="w-full h-full cursor-pointer"
          onPointerMove={handlePointerMove}
          onClick={handleClick}
        >
          <Canvas
            camera={{ position: [15, 10, 15], fov: 50 }}
            onCreated={({ gl }) => {
              console.log('Canvas created, WebGL context:', gl.capabilities);
            }}
          >
            <Suspense fallback={null}>
              <InteractiveScene
                {...props}
                cargoItems={enrichedCargoItems}
                previewPosition={previewPosition}
                isValidPosition={isValidPosition}
                onSceneReady={handleSceneReady}
              />
            </Suspense>
          </Canvas>
        </div>
      </Canvas3DErrorBoundary>
    </div>
  );
}
