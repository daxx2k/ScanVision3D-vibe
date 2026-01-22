
import React, { useMemo, useRef, useEffect } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import { ScanSettings } from '../App';

interface ModelManagerProps {
  url: string;
  format: string | null;
  isScanning: boolean;
  settings: ScanSettings;
  onScanComplete: () => void;
  scanlineRef: React.RefObject<HTMLDivElement | null>;
  scanlineTrailRef: React.RefObject<HTMLDivElement | null>;
}

const COOL_OFF_SECONDS = 2.0;

const ModelRenderer: React.FC<{ 
  model: THREE.Object3D; 
  isScanning: boolean; 
  settings: ScanSettings; 
  onScanComplete: () => void;
  scanlineRef: React.RefObject<HTMLDivElement | null>;
  scanlineTrailRef: React.RefObject<HTMLDivElement | null>;
}> = ({ model, isScanning, settings, onScanComplete, scanlineRef, scanlineTrailRef }) => {
  const containerRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const scanProgress = useRef(0);
  const isGoingForward = useRef(true);

  const uniforms = useMemo(() => ({
    uScanProgress: { value: 0 },
    uDirection: { value: 0 },
    uResolution: { value: new THREE.Vector2(gl.domElement.width, gl.domElement.height) },
    uScanActive: { value: 0.0 },
    uFade: { value: 1.0 },
  }), [gl]);

  useEffect(() => {
    uniforms.uResolution.value.set(gl.domElement.width, gl.domElement.height);
  }, [gl.domElement.width, gl.domElement.height, uniforms]);

  const injectShader = (shader: any, isWireframe: boolean) => {
    shader.uniforms.uScanProgress = uniforms.uScanProgress;
    shader.uniforms.uDirection = uniforms.uDirection;
    shader.uniforms.uResolution = uniforms.uResolution;
    shader.uniforms.uScanActive = uniforms.uScanActive;
    shader.uniforms.uFade = uniforms.uFade;
    
    shader.fragmentShader = `
      uniform float uScanProgress;
      uniform int uDirection;
      uniform vec2 uResolution;
      uniform float uScanActive;
      uniform float uFade;

      float getScanVal(vec2 uv, int dir) {
        vec2 st = vec2(uv.x, 1.0 - uv.y);
        if (dir == 0) return st.y;                      // TOP_BOTTOM
        if (dir == 1) return 1.0 - st.y;                 // BOTTOM_TOP
        if (dir == 2) return st.x;                      // LEFT_RIGHT
        if (dir == 3) return 1.0 - st.x;                 // RIGHT_LEFT
        if (dir == 4) return (st.x + st.y) * 0.5;        // TL_BR
        if (dir == 5) return ((1.0 - st.x) + st.y) * 0.5; // TR_BL
        if (dir == 6) return (st.x + (1.0 - st.y)) * 0.5; // BL_TR
        if (dir == 7) return ((1.0 - st.x) + (1.0 - st.y)) * 0.5; // BR_TL
        return 0.0;
      }
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <clipping_planes_fragment>',
      `
      #include <clipping_planes_fragment>
      vec2 screenUV = gl_FragCoord.xy / uResolution;
      float val = getScanVal(screenUV, uDirection);
      float threshold = uScanProgress;

      if (uScanActive > 0.5) {
        if (${isWireframe}) {
          if (val > threshold) discard;
        } else {
          // Clip solid model only during active phase
          if (val <= threshold && uFade > 0.99) discard;
        }
      } else {
        if (${isWireframe}) discard;
      }
      `
    );
  };

  const { normalizedScale, localBoundingBox } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const boxSize = new THREE.Vector3(); box.getSize(boxSize);
    const center = new THREE.Vector3(); box.getCenter(center);
    const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
    const scale = maxDim > 0 ? 5.0 / maxDim : 1;
    model.position.set(-center.x, -center.y, -center.z);
    return { normalizedScale: scale, localBoundingBox: box };
  }, [model]);

  const originalModel = useMemo(() => {
    const clone = model.clone();
    clone.traverse((child: any) => {
      if (child.isMesh) {
        const prepareMaterial = (m: any) => {
          const nm = m.clone();
          nm.transparent = true;
          nm.opacity = 1.0;
          nm.onBeforeCompile = (s: any) => injectShader(s, false);
          return nm;
        };
        child.material = Array.isArray(child.material) 
          ? child.material.map(prepareMaterial)
          : prepareMaterial(child.material);
      }
    });
    return clone;
  }, [model, settings.direction]);

  const wireframeModel = useMemo(() => {
    const clone = model.clone();
    clone.traverse((child: any) => {
      if (child.isMesh) {
        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(settings.wireframeColor),
          wireframe: true,
          transparent: true,
          opacity: settings.wireframeOpacity,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 4
        });
        mat.onBeforeCompile = (shader) => injectShader(shader, true);
        child.material = mat;
      }
    });
    return clone;
  }, [model, settings.wireframeColor, settings.wireframeOpacity, settings.direction]);

  useFrame((state, delta) => {
    if (containerRef.current) containerRef.current.rotation.y += delta * settings.spinningSpeed;

    if (isScanning) {
      const step = delta * settings.speed;
      
      if (settings.pingPong) {
        uniforms.uFade.value = 1.0;
        uniforms.uScanActive.value = 1.0;
        if (isGoingForward.current) {
          scanProgress.current += step;
          if (scanProgress.current >= 1.0) { scanProgress.current = 1.0; isGoingForward.current = false; }
        } else {
          scanProgress.current -= step;
          if (scanProgress.current <= 0.0) { scanProgress.current = 0.0; isGoingForward.current = true; }
        }
        uniforms.uScanProgress.value = scanProgress.current;
      } else {
        scanProgress.current += step;
        const totalPhase = 1.0 + (COOL_OFF_SECONDS * settings.speed);
        if (scanProgress.current <= 1.0) {
          uniforms.uScanActive.value = 1.0;
          uniforms.uScanProgress.value = scanProgress.current;
          uniforms.uFade.value = 1.0;
        } else {
          const coolProgress = (scanProgress.current - 1.0) / (COOL_OFF_SECONDS * settings.speed);
          uniforms.uFade.value = THREE.MathUtils.clamp(1.0 - coolProgress * 2, 0, 1);
          if (scanProgress.current > totalPhase) {
            if (settings.loop) scanProgress.current = 0;
            else onScanComplete();
          }
        }
        isGoingForward.current = true;
      }
    } else {
      if (uniforms.uFade.value > 0) {
        uniforms.uFade.value = Math.max(0, uniforms.uFade.value - delta * 2.0);
      } else {
        uniforms.uScanActive.value = 0.0;
      }
      isGoingForward.current = true;
    }

    const fade = uniforms.uFade.value;

    originalModel.traverse((child: any) => {
      if (child.isMesh) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((m: any) => {
          m.opacity = 1.0 - fade;
          if (fade > 0.99) m.opacity = 1.0;
        });
      }
    });

    wireframeModel.traverse((child: any) => {
      if (child.isMesh) {
        child.material.opacity = settings.wireframeOpacity * fade;
        child.material.color.set(settings.wireframeColor);
      }
    });

    if (scanlineRef.current) {
      const isVisible = isScanning && (settings.pingPong || scanProgress.current <= 1.0);
      const p = isScanning ? scanProgress.current : 0;
      const dir = settings.direction;
      let tx = 50, ty = 50, rot = 0;
      let baseFlipped = false;

      // Fixed Coordinate mapping for 2D scanline to match 3D shader clipping
      if (dir === 'TOP_BOTTOM') { tx = 50; ty = p * 100; rot = 0; baseFlipped = false; }
      else if (dir === 'BOTTOM_TOP') { tx = 50; ty = (1 - p) * 100; rot = 0; baseFlipped = true; }
      else if (dir === 'LEFT_RIGHT') { tx = p * 100; ty = 50; rot = 90; baseFlipped = true; } 
      else if (dir === 'RIGHT_LEFT') { tx = (1 - p) * 100; ty = 50; rot = 90; baseFlipped = false; }
      else if (dir === 'TL_BR') { tx = p * 100; ty = p * 100; rot = -45; baseFlipped = false; }
      else if (dir === 'TR_BL') { tx = (1 - p) * 100; ty = p * 100; rot = 45; baseFlipped = false; }
      else if (dir === 'BL_TR') { tx = p * 100; ty = (1 - p) * 100; rot = 45; baseFlipped = true; }
      else if (dir === 'BR_TL') { tx = (1 - p) * 100; ty = (1 - p) * 100; rot = -45; baseFlipped = true; }

      const movementFlipped = settings.pingPong && !isGoingForward.current;
      const actualTrailFlipped = baseFlipped ? !movementFlipped : movementFlipped;

      scanlineRef.current.style.transform = `translate3d(${tx}vw, ${ty}vh, 0) rotate(${rot}deg)`;
      scanlineRef.current.style.opacity = isVisible ? '1' : '0';

      if (scanlineTrailRef.current) {
        const trailVisible = isVisible;
        const color = settings.trailColor;
        const t = scanlineTrailRef.current;
        t.style.opacity = trailVisible ? settings.trailOpacity.toString() : '0';
        t.style.backgroundImage = `linear-gradient(to top, ${color}, transparent)`;
        t.style.height = `${settings.trailLength}vh`;
        
        if (actualTrailFlipped) {
          t.style.top = `${settings.scanlineThickness}px`;
          t.style.bottom = 'auto';
          t.style.transform = 'scaleY(-1)';
        } else {
          t.style.top = 'auto';
          t.style.bottom = `${settings.scanlineThickness}px`;
          t.style.transform = 'scaleY(1)';
        }
      }
    }

    const dirMap = { 
      'TOP_BOTTOM': 0, 'BOTTOM_TOP': 1, 'LEFT_RIGHT': 2, 'RIGHT_LEFT': 3,
      'TL_BR': 4, 'TR_BL': 5, 'BL_TR': 6, 'BR_TL': 7
    };
    uniforms.uDirection.value = dirMap[settings.direction];
  });

  return (
    <group scale={normalizedScale}>
      <group ref={containerRef}>
        <primitive object={originalModel} />
        <primitive object={wireframeModel} />
        {(isScanning && scanProgress.current <= 1.0) && <ScanParticles boundingBox={localBoundingBox} color={settings.wireframeColor} />}
      </group>
    </group>
  );
};

export const ModelManager: React.FC<ModelManagerProps> = (props) => {
  const LoaderClass = useMemo(() => {
    if (props.format === 'obj') return OBJLoader;
    if (props.format === 'fbx') return FBXLoader;
    return GLTFLoader;
  }, [props.format]);

  const result = useLoader(LoaderClass, props.url);
  const processedModel = useMemo(() => {
    const scene = (result as any).scene || (result as any).children?.[0] || result;
    return scene.clone ? scene.clone() : scene;
  }, [result]);

  return <ModelRenderer {...props} model={processedModel} />;
};

const ScanParticles: React.FC<{ boundingBox: THREE.Box3, color: string }> = ({ boundingBox, color }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1500;
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const size = new THREE.Box3().copy(boundingBox).getSize(new THREE.Vector3());
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * size.x * 1.6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * size.y * 1.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * size.z * 1.6;
    }
    return positions;
  }, [boundingBox]);
  useFrame((state, delta) => { if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.15; });
  return (
    <points ref={pointsRef}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={particles} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.012} color={color} transparent opacity={0.3} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};
