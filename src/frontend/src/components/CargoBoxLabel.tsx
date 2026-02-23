import { Text } from '@react-three/drei';
import { Position3D } from '../types/cargo';

interface CargoBoxLabelProps {
  text: string;
  position: Position3D;
}

export function CargoBoxLabel({ text, position }: CargoBoxLabelProps) {
  // Note: Text component from @react-three/drei will gracefully handle font loading
  // If the font fails to load, it will use a fallback or simply not render
  return (
    <Text
      position={[position.x, position.y, position.z]}
      fontSize={0.3}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
      outlineColor="#000000"
    >
      {text}
    </Text>
  );
}
