
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Stars,
  Environment
} from '@react-three/drei';
import * as THREE from 'three';
import { ModelManager } from './ModelManager';
import { ScanSettings } from '../App';

interface ModelViewerProps {
  url: string | null;
  format: string | null;
  isScanning: boolean;
  settings: ScanSettings;
  onScanComplete: () => void;
  scanlineRef: React.RefObject<HTMLDivElement | null>;
  scanlineTrailRef: React.RefObject<HTMLDivElement | null>;
}

const SceneContent: React.FC<ModelViewerProps> = ({ url, format, isScanning, settings, onScanComplete, scanlineRef, scanlineTrailRef }) => {
  return (
    <>
      <ambientLight intensity={1.0} />
      
      <spotLight 
        position={[15, 20, 15]} 
        angle={0.5} 
        penumbra={1} 
        intensity={20} 
        color={settings.uiColor} 
        castShadow 
      />
      <pointLight 
        position={[-15, 10, -15]} 
        intensity={15} 
        color="#ffffff" 
      />
      
      {settings.showStars && (
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      )}
      
      <Suspense fallback={null}>
        <Environment 
          preset={settings.envPreset} 
          environmentIntensity={settings.envIntensity} 
        />
        {url && (
          <ModelManager 
            url={url} 
            format={format} 
            isScanning={isScanning} 
            settings={settings} 
            onScanComplete={onScanComplete} 
            scanlineRef={scanlineRef}
            scanlineTrailRef={scanlineTrailRef}
          />
        )}
      </Suspense>
    </>
  );
};

export const ModelViewer: React.FC<ModelViewerProps> = (props) => {
  return (
    <Canvas 
      shadows 
      gl={{ 
        antialias: true, 
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        localClippingEnabled: true 
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 1, 10]} fov={35} />
      <SceneContent {...props} />
      <OrbitControls 
        makeDefault 
        enableDamping 
        dampingFactor={0.05} 
        minDistance={3} 
        maxDistance={40}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
};
