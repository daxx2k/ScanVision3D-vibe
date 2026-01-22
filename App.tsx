
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ModelViewer } from './components/ModelViewer';
import { UIOverlay } from './components/UIOverlay';
import { Loader2, UploadCloud, Terminal, Database, Settings2 } from 'lucide-react';

export type ScanDirection = 
  | 'TOP_BOTTOM' | 'BOTTOM_TOP' 
  | 'LEFT_RIGHT' | 'RIGHT_LEFT'
  | 'TL_BR' | 'TR_BL' 
  | 'BL_TR' | 'BR_TL';

export type BackgroundType = 'SOLID' | 'GRID' | 'DOTS' | 'VIGNETTE' | 'CROSS';

export type EnvPreset = 'city' | 'apartment' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'warehouse' | 'sunset';

export interface ScanSettings {
  speed: number;
  spinningSpeed: number;
  wireframeThickness: number;
  wireframeOpacity: number;
  loop: boolean;
  pingPong: boolean;
  uiColor: string;
  wireframeColor: string;
  beamColor: string;
  trailColor: string;
  autoScan: boolean;
  direction: ScanDirection;
  scanlineThickness: number;
  trailLength: number;
  trailOpacity: number;
  pageTitle: string;
  showUI: boolean;
  // Background Settings
  bgType: BackgroundType;
  bgColor: string;
  gridColor: string;
  gridSize: number;
  gridOpacity: number;
  showStars: boolean;
  // Environment Mapping
  envPreset: EnvPreset;
  envIntensity: number;
  exposure: number;
}

export default function App() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const scanlineRef = useRef<HTMLDivElement>(null);
  const scanlineTrailRef = useRef<HTMLDivElement>(null);
  
  const [scanSettings, setScanSettings] = useState<ScanSettings>({
    speed: 0.5,
    spinningSpeed: 0.4,
    wireframeThickness: 1.0,
    wireframeOpacity: 0.8,
    loop: true,
    pingPong: false,
    uiColor: '#00f3ff',
    wireframeColor: '#00f3ff',
    beamColor: '#00f3ff',
    trailColor: '#00f3ff',
    autoScan: true,
    direction: 'TOP_BOTTOM',
    scanlineThickness: 4,
    trailLength: 30,
    trailOpacity: 0.4,
    pageTitle: 'SCANVISION // OS',
    showUI: true,
    bgType: 'GRID',
    bgColor: '#050505',
    gridColor: '#00f3ff',
    gridSize: 50,
    gridOpacity: 0.05,
    showStars: true,
    envPreset: 'city',
    envIntensity: 1.0,
    exposure: 1.0
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const url = URL.createObjectURL(file);
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    setModelUrl(url);
    setFormat(ext || null);
    setIsScanning(false);
    
    setTimeout(() => setIsLoading(false), 1200);
  };

  const handleLibrarySelect = useCallback((url: string, fmt: string) => {
    setIsLoading(true);
    setModelUrl(url);
    setFormat(fmt);
    setIsScanning(false);
    setTimeout(() => setIsLoading(false), 1200);
  }, []);

  const toggleScan = useCallback(() => {
    if (!modelUrl) return;
    setIsScanning(prev => !prev);
  }, [modelUrl]);

  const stopScan = useCallback(() => {
    setIsScanning(false);
  }, []);

  useEffect(() => {
    if (modelUrl && !isLoading && scanSettings.autoScan) {
      setIsScanning(true);
    }
  }, [modelUrl, isLoading, scanSettings.autoScan]);

  // Update browser tab title based on user setting
  useEffect(() => {
    document.title = scanSettings.pageTitle.toUpperCase();
  }, [scanSettings.pageTitle]);

  const getBackgroundStyle = () => {
    const { bgType, bgColor, gridColor, gridSize, gridOpacity } = scanSettings;
    const styles: React.CSSProperties = {
      backgroundColor: bgColor,
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden'
    };

    let backgroundImage = '';
    const colorWithAlpha = `${gridColor}${Math.floor(gridOpacity * 255).toString(16).padStart(2, '0')}`;

    switch (bgType) {
      case 'GRID':
        backgroundImage = `
          linear-gradient(${colorWithAlpha} 1px, transparent 1px),
          linear-gradient(90deg, ${colorWithAlpha} 1px, transparent 1px)
        `;
        styles.backgroundSize = `${gridSize}px ${gridSize}px`;
        break;
      case 'DOTS':
        backgroundImage = `radial-gradient(${colorWithAlpha} 1px, transparent 1px)`;
        styles.backgroundSize = `${gridSize}px ${gridSize}px`;
        break;
      case 'CROSS':
        backgroundImage = `
          linear-gradient(${colorWithAlpha} 1px, transparent 1px),
          linear-gradient(90deg, ${colorWithAlpha} 1px, transparent 1px)
        `;
        styles.backgroundSize = `${gridSize}px ${gridSize}px`;
        styles.backgroundPosition = `-${gridSize/2}px -${gridSize/2}px`;
        break;
      case 'VIGNETTE':
        backgroundImage = `radial-gradient(circle, transparent 20%, ${bgColor} 100%)`;
        break;
      default:
        backgroundImage = 'none';
    }

    styles.backgroundImage = backgroundImage;
    return styles;
  };

  return (
    <div 
      className="transition-colors duration-500"
      style={getBackgroundStyle() as React.CSSProperties}
    >
      {/* 2D Scanline Layer */}
      <div 
        ref={scanlineRef}
        className={`absolute z-40 pointer-events-none transition-none ${isScanning ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          width: '300vmax', 
          height: `${scanSettings.scanlineThickness}px`,
          left: '0',
          top: '0',
          marginLeft: '-150vmax',
          marginTop: `-${scanSettings.scanlineThickness / 2}px`,
          willChange: 'transform',
          backgroundColor: scanSettings.beamColor,
          boxShadow: `0 0 20px ${scanSettings.beamColor}, 0 0 40px ${scanSettings.beamColor}`
        }}
      >
        <div 
          ref={scanlineTrailRef}
          className="absolute left-0 w-full pointer-events-none origin-center"
          style={{ 
            height: `${scanSettings.trailLength}vh`, 
          }} 
        />
      </div>

      <div className="absolute inset-0 z-0">
        <ModelViewer 
          url={modelUrl} 
          format={format} 
          isScanning={isScanning} 
          settings={scanSettings}
          onScanComplete={stopScan}
          scanlineRef={scanlineRef}
          scanlineTrailRef={scanlineTrailRef}
        />
      </div>

      {!modelUrl && !isLoading && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center z-20 p-4 transition-opacity duration-500 ${scanSettings.showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="max-w-xl w-full text-center space-y-12 animate-fade-in relative">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter glitch uppercase" style={{ color: scanSettings.uiColor }}>
                {scanSettings.pageTitle.split(' // ')[0] || scanSettings.pageTitle}
              </h1>
              <div className="flex items-center justify-center gap-4 text-[10px] md:text-xs font-bold tracking-[0.5em] uppercase text-magenta-500">
                <span className="h-px w-8 md:w-12 bg-magenta-500"></span>
                Digital Asset Analysis
                <span className="h-px w-8 md:w-12 bg-magenta-500"></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-500" style={{ backgroundColor: scanSettings.uiColor }}></div>
                <label className="relative flex flex-col items-center justify-center w-full h-48 md:h-80 bg-black border cursor-pointer transition-all" style={{ borderColor: `${scanSettings.uiColor}4d` }}>
                  <div className="flex flex-col items-center justify-center p-4 md:p-8 text-center">
                    <UploadCloud className="w-10 h-10 md:w-12 md:h-12 mb-4 md:mb-6 animate-pulse" style={{ color: scanSettings.uiColor }} />
                    <p className="text-sm md:text-lg font-bold uppercase tracking-widest text-white">Upload Neural Data</p>
                  </div>
                  <input type="file" className="hidden" accept=".glb,.gltf,.obj,.fbx" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="relative group" onClick={() => handleLibrarySelect('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb', 'glb')}>
                <div className="absolute -inset-1 bg-gradient-to-r from-magenta-600 to-magenta-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative flex flex-col items-center justify-center w-full h-48 md:h-80 bg-black border border-magenta-500/30 cursor-pointer hover:border-magenta-500 transition-all">
                  <div className="flex flex-col items-center justify-center p-4 md:p-8 text-center">
                    <Database className="w-10 h-10 md:w-12 md:h-12 mb-4 md:mb-6 text-magenta-500 animate-pulse" />
                    <p className="text-sm md:text-lg font-bold uppercase tracking-widest text-white">Access Archive</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black backdrop-blur-md">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin" style={{ color: scanSettings.uiColor }} />
              <div className="absolute inset-0 blur-xl animate-pulse" style={{ backgroundColor: `${scanSettings.uiColor}4d` }}></div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="mono uppercase tracking-[0.6em] text-sm font-black italic" style={{ color: scanSettings.uiColor }}>Compiling Mesh...</span>
            </div>
          </div>
        </div>
      )}

      {modelUrl && !isLoading && (
        <UIOverlay 
          onUpload={handleFileUpload} 
          onScan={toggleScan} 
          onSelectLibrary={handleLibrarySelect}
          isScanning={isScanning}
          settings={scanSettings}
          onSettingsChange={setScanSettings}
        />
      )}

      {/* Hidden UI Restore Trigger */}
      {!scanSettings.showUI && (
        <button 
          onClick={() => setScanSettings({ ...scanSettings, showUI: true })}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-black/80 border border-white/10 hover:border-white/40 transition-all group pointer-events-auto"
          title="Restore UI"
        >
          <Settings2 className="w-6 h-6 text-white opacity-50 group-hover:opacity-100" />
        </button>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${scanSettings.uiColor};
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
