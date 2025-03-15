// src/DesktopAnimation.js
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

const DesktopIcon3D = ({ position }) => {
  const meshRef = useRef();

  useFrame(() => {
    meshRef.current.rotation.y += 0.01; 
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

const DesktopAnimation = () => {
  return (
    <Canvas className="w-full h-64">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <DesktopIcon3D position={[0, 0, 0]} />
    </Canvas>
  );
};

export default DesktopAnimation;
