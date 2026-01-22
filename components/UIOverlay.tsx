
import React, { useState, useEffect } from 'react';
import { 
  Scan, RefreshCw, Cpu, Terminal, Zap, Archive, 
  Settings2, Sliders, ToggleLeft, ToggleRight, 
  ArrowDown, ArrowUp, ArrowRight, ArrowLeft,
  MoveUpLeft, MoveUpRight, MoveDownLeft, MoveDownRight,
  RotateCw, FastForward, Activity, Maximize, Minimize,
  Layers, Ghost, Palette, Eye, EyeOff, Edit3,
  Box, Grid, Layout, Circle, Square, ChevronDown, ChevronRight,
  Sun, Wind, Sparkles, Stars as StarsIcon, Zap as LightingIcon
} from 'lucide-react';
import { ScanSettings, ScanDirection, BackgroundType, EnvPreset } from '../App';

interface LibraryModel {
  id: string;
  name: string;
  url: string;
  polyCount: string;
  type: string;
}

const MODEL_LIBRARY: LibraryModel[] = [
  { id: 'helmet-01', name: 'TACTICAL HELMET', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb', polyCount: '15K', type: 'HARDWARE' },
  { id: 'drone-01', name: 'RESEARCH UNIT', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb', polyCount: '2.4K', type: 'UNIT' },
  { id: 'avocado-n', name: 'BIO-ORGANIC', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb', polyCount: '1.8K', type: 'ORGANIC' },
  { id: 'box-p', name: 'DATA PACKAGE', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb', polyCount: '12', type: 'PRIMITIVE' }
];

interface UIOverlayProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScan: () => void;
  onSelectLibrary: (url: string, format: string) => void;
  isScanning: boolean;
  settings: ScanSettings;
  onSettingsChange: (settings: ScanSettings) => void;
}

const ConfigSection: React.FC<{ 
  title: string; 
  icon: any; 
  isOpen: boolean; 
  toggle: () => void; 
  themeColor: string;
  children: React.ReactNode;
}> = ({ title, icon: Icon, isOpen, toggle, themeColor, children }) => {
  return (
    <div className="border-b border-white/5 last:border-none">
      <button 
        onClick={toggle}
        className="w-full flex items-center justify-between py-3 px-1 transition-all hover:bg-white/5"
        style={{ color: themeColor }}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      {isOpen && (
        <div className="pb-4 pt-1 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export const UIOverlay: React.FC<UIOverlayProps> = ({ onUpload, onScan, onSelectLibrary, isScanning, settings, onSettingsChange }) => {
  const [dataStream, setDataStream] = useState<string>('');
  const [showLibrary, setShowLibrary] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    branding: true,
    presets: false,
    environment: false,
    luminance: false,
    visuals: false,
    motion: false
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const chars = '01ABCDEF';
      let str = '';
      for(let i=0; i<8; i++) str += chars.charAt(Math.floor(Math.random() * chars.length));
      setDataStream(str);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const applyPreset = (presetName: string) => {
    let updates = {};
    switch (presetName) {
      case 'EVANGELION':
        updates = {
          uiColor: '#a020f0',
          wireframeColor: '#ff4500',
          beamColor: '#39ff14',
          trailColor: '#a020f0',
          bgColor: '#08050a',
          gridColor: '#39ff14',
          gridOpacity: 0.08,
          bgType: 'GRID' as BackgroundType,
          showStars: false,
          envPreset: 'sunset' as EnvPreset,
          envIntensity: 1.5
        };
        break;
      case 'GHOST_SHELL':
        updates = {
          uiColor: '#00ff41',
          wireframeColor: '#00ff41',
          beamColor: '#00ff41',
          trailColor: '#003b00',
          bgColor: '#000000',
          gridColor: '#00ff41',
          gridOpacity: 0.05,
          bgType: 'CROSS' as BackgroundType,
          showStars: true,
          envPreset: 'city' as EnvPreset,
          envIntensity: 1.0
        };
        break;
      case 'VAPORWAVE':
        updates = {
          uiColor: '#ff00ff',
          wireframeColor: '#00ffff',
          beamColor: '#ff00ff',
          trailColor: '#00ffff',
          bgColor: '#1a0033',
          gridColor: '#ff00ff',
          gridOpacity: 0.1,
          bgType: 'GRID' as BackgroundType,
          showStars: false,
          envPreset: 'night' as EnvPreset,
          envIntensity: 2.0
        };
        break;
      case 'TERMINATOR':
        updates = {
          uiColor: '#ff0000',
          wireframeColor: '#333333',
          beamColor: '#ff0000',
          trailColor: '#660000',
          bgColor: '#050000',
          gridColor: '#ff0000',
          gridOpacity: 0.03,
          bgType: 'DOTS' as BackgroundType,
          showStars: false,
          envPreset: 'warehouse' as EnvPreset,
          envIntensity: 0.8
        };
        break;
    }
    onSettingsChange({ ...settings, ...updates });
  };

  const themeStyle = { color: settings.uiColor };
  const borderStyle = { borderColor: settings.uiColor };
  const bgStyle = { backgroundColor: settings.uiColor };

  const directions: { val: ScanDirection, icon: any }[] = [
    { val: 'TOP_BOTTOM', icon: ArrowDown },
    { val: 'BOTTOM_TOP', icon: ArrowUp },
    { val: 'LEFT_RIGHT', icon: ArrowRight },
    { val: 'RIGHT_LEFT', icon: ArrowLeft },
    { val: 'TL_BR', icon: MoveDownRight },
    { val: 'TR_BL', icon: MoveDownLeft },
    { val: 'BL_TR', icon: MoveUpRight },
    { val: 'BR_TL', icon: MoveUpLeft },
  ];

  const backgroundTypes: { val: BackgroundType, icon: any, label: string }[] = [
    { val: 'SOLID', icon: Box, label: 'Solid' },
    { val: 'GRID', icon: Grid, label: 'Grid' },
    { val: 'DOTS', icon: Circle, label: 'Dots' },
    { val: 'CROSS', icon: Square, label: 'Cross' },
    { val: 'VIGNETTE', icon: Layout, label: 'Vignette' },
  ];

  const envPresets: { val: EnvPreset, label: string }[] = [
    { val: 'studio', label: 'Studio' },
    { val: 'city', label: 'City' },
    { val: 'warehouse', label: 'Base' },
    { val: 'dawn', label: 'Dawn' },
    { val: 'night', label: 'Night' },
    { val: 'forest', label: 'Wild' }
  ];

  if (!settings.showUI) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-20 transition-opacity duration-500 ${settings.showUI ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start pointer-events-auto gap-4">
        <div className="bg-black/80 p-3 md:p-4 backdrop-blur-md shadow-lg border-l-4 w-full md:w-auto" style={borderStyle}>
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-black tracking-[0.2em] md:tracking-[0.3em] glitch italic uppercase" style={themeStyle}>{settings.pageTitle}</h2>
            <div className="px-2 py-1 text-black text-[8px] md:text-[10px] font-bold" style={bgStyle}>CORE-v5.0</div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-[8px] md:text-[10px] mono uppercase font-semibold" style={{ color: `${settings.uiColor}cc` }}>
            <span className="flex items-center gap-1"><Terminal className="w-3 h-3"/> ADDR: 0x{dataStream}</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3"/> SYNC: STABLE</span>
            <span className="w-2 h-2 rounded-full animate-ping" style={bgStyle} />
          </div>
        </div>

        <div className="flex gap-2 md:gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <button onClick={() => {setShowConfig(!showConfig); setShowLibrary(false);}} className="cyber-button flex flex-1 md:flex-none items-center justify-center gap-2 px-4 md:px-6 py-3 bg-black/80 border transition-all backdrop-blur-md" style={{ borderColor: showConfig ? settings.uiColor : `${settings.uiColor}80`, color: showConfig ? settings.uiColor : `${settings.uiColor}cc` }}>
            <Sliders className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Config</span>
          </button>
          <button onClick={() => {setShowLibrary(!showLibrary); setShowConfig(false);}} className="cyber-button flex flex-1 md:flex-none items-center justify-center gap-2 px-4 md:px-6 py-3 bg-black/80 border transition-all backdrop-blur-md" style={{ borderColor: showLibrary ? '#ff00ff' : '#ff00ff80', color: showLibrary ? '#ff00ff' : '#ff00ffcc' }}>
            <Archive className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Archive</span>
          </button>
          <label className="cyber-button flex flex-1 md:flex-none items-center justify-center gap-2 px-4 md:px-6 py-3 bg-black/80 border cursor-pointer transition-all backdrop-blur-md" style={{ borderColor: `${settings.uiColor}80`, color: settings.uiColor }}>
            <RefreshCw className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Buffer</span>
            <input type="file" className="hidden" accept=".glb,.gltf,.obj,.fbx" onChange={onUpload} />
          </label>
          <button onClick={toggleFullscreen} className="cyber-button flex flex-1 md:flex-none items-center justify-center gap-2 px-4 md:px-6 py-3 bg-black/80 border transition-all backdrop-blur-md" style={{ borderColor: `${settings.uiColor}80`, color: settings.uiColor }}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{isFullscreen ? 'Exit' : 'Full'}</span>
          </button>
        </div>
      </div>

      {/* Config Panel */}
      <div className={`fixed left-4 right-4 md:left-6 md:right-auto top-20 md:top-24 md:w-80 transition-all duration-500 pointer-events-auto z-50 ${showConfig ? 'translate-x-0 opacity-100' : 'translate-x-[120%] md:translate-x-[-120%] opacity-0'}`}>
        <div className="bg-black/95 border-l-4 p-5 backdrop-blur-xl shadow-2xl h-[75vh] md:h-[80vh] flex flex-col" style={borderStyle}>
          <div className="flex items-center justify-between mb-4 border-b pb-2 flex-shrink-0" style={{ borderColor: `${settings.uiColor}4d` }}>
            <h3 className="text-[10px] font-black uppercase tracking-widest" style={themeStyle}>Neural Control Unit</h3>
            <button onClick={() => setShowConfig(false)} className="text-xl leading-none" style={themeStyle}>×</button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1">
            
            {/* BRANDING SECTION */}
            <ConfigSection title="Branding & System" icon={Terminal} isOpen={openSections.branding} toggle={() => toggleSection('branding')} themeColor={settings.uiColor}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-bold uppercase block opacity-50">System Identity</label>
                  <div className="flex items-center gap-2 bg-white/5 p-2 rounded border border-white/10">
                    <Edit3 className="w-3 h-3 opacity-40" />
                    <input 
                      type="text" 
                      value={settings.pageTitle}
                      onChange={(e) => onSettingsChange({ ...settings, pageTitle: e.target.value.toUpperCase() })}
                      className="bg-transparent border-none outline-none text-[10px] font-bold w-full uppercase tracking-widest"
                      style={themeStyle}
                      placeholder="ENTER NAME..."
                    />
                  </div>
                </div>

                <button 
                  onClick={() => onSettingsChange({ ...settings, showUI: false })}
                  className="w-full flex items-center justify-between p-2 border transition-all hover:bg-white/5 text-[9px] font-black uppercase tracking-widest"
                  style={{ borderColor: `${settings.uiColor}4d`, color: settings.uiColor }}
                >
                  Cloak Interface
                  <EyeOff className="w-3 h-3" />
                </button>
              </div>
            </ConfigSection>

            {/* PRESETS SECTION */}
            <ConfigSection title="Spectral Presets" icon={Sparkles} isOpen={openSections.presets} toggle={() => toggleSection('presets')} themeColor={settings.uiColor}>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'EVANGELION', label: 'Unit-01', color: '#a020f0' },
                  { name: 'GHOST_SHELL', label: 'Neural Link', color: '#00ff41' },
                  { name: 'VAPORWAVE', label: 'Neo-Tokyo', color: '#ff00ff' },
                  { name: 'TERMINATOR', label: 'Cyberdyne', color: '#ff0000' }
                ].map(p => (
                  <button 
                    key={p.name}
                    onClick={() => applyPreset(p.name)}
                    className="flex flex-col gap-1 p-2 border text-left transition-all hover:bg-white/5"
                    style={{ borderColor: `${p.color}4d`, color: p.color }}
                  >
                    <span className="text-[7px] font-bold uppercase opacity-50">Visual Type</span>
                    <span className="text-[9px] font-black uppercase">{p.label}</span>
                  </button>
                ))}
              </div>
            </ConfigSection>

            {/* LUMINANCE SECTION */}
            <ConfigSection title="Luminance & HDRI" icon={LightingIcon} isOpen={openSections.luminance} toggle={() => toggleSection('luminance')} themeColor={settings.uiColor}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-bold uppercase block opacity-50">HDRI Atmosphere</label>
                  <div className="grid grid-cols-3 gap-1">
                    {envPresets.map(preset => (
                      <button 
                        key={preset.val}
                        onClick={() => onSettingsChange({ ...settings, envPreset: preset.val })}
                        className="p-2 border text-[8px] font-bold uppercase transition-all"
                        style={{ 
                          backgroundColor: settings.envPreset === preset.val ? `${settings.uiColor}33` : 'transparent',
                          borderColor: settings.envPreset === preset.val ? settings.uiColor : `${settings.uiColor}33`,
                          color: settings.envPreset === preset.val ? settings.uiColor : `${settings.uiColor}66`
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex justify-between text-[8px] font-bold uppercase opacity-50">IBL Intensity <span>{(settings.envIntensity * 100).toFixed(0)}%</span></label>
                  <input type="range" min="0" max="5.0" step="0.1" value={settings.envIntensity} onChange={(e) => onSettingsChange({ ...settings, envIntensity: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-900 appearance-none cursor-pointer accent-current" style={themeStyle} />
                </div>
              </div>
            </ConfigSection>

            {/* ENVIRONMENT SECTION */}
            <ConfigSection title="Environment Matrix" icon={Layout} isOpen={openSections.environment} toggle={() => toggleSection('environment')} themeColor={settings.uiColor}>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-1">
                  {backgroundTypes.map(({ val, icon: Icon, label }) => (
                    <button 
                      key={val}
                      onClick={() => onSettingsChange({ ...settings, bgType: val })}
                      className="flex flex-col items-center justify-center p-2 border transition-all gap-1"
                      style={{ 
                        backgroundColor: settings.bgType === val ? `${settings.uiColor}33` : 'transparent',
                        borderColor: settings.bgType === val ? settings.uiColor : `${settings.uiColor}33`,
                        color: settings.bgType === val ? settings.uiColor : `${settings.uiColor}66`
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                    <span className="text-[8px] uppercase font-bold opacity-60">Primary Ambient</span>
                    <input type="color" value={settings.bgColor} onChange={(e) => onSettingsChange({ ...settings, bgColor: e.target.value })} className="w-8 h-6 rounded bg-transparent border-none cursor-pointer" />
                  </div>

                  <button 
                    onClick={() => onSettingsChange({ ...settings, showStars: !settings.showStars })}
                    className="w-full flex items-center justify-between p-2 border transition-all hover:bg-white/5 text-[9px] font-black uppercase tracking-widest"
                    style={{ 
                      backgroundColor: settings.showStars ? `${settings.uiColor}1a` : 'transparent',
                      borderColor: `${settings.uiColor}4d`, 
                      color: settings.uiColor 
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <StarsIcon className="w-3 h-3" />
                      Deep Space Particles
                    </span>
                    <span className="text-[7px] opacity-50">{settings.showStars ? 'ACTIVE' : 'OFF'}</span>
                  </button>

                  {settings.bgType !== 'SOLID' && settings.bgType !== 'VIGNETTE' && (
                    <>
                      <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                        <span className="text-[8px] uppercase font-bold opacity-60">Pattern Color</span>
                        <input type="color" value={settings.gridColor} onChange={(e) => onSettingsChange({ ...settings, gridColor: e.target.value })} className="w-8 h-6 rounded bg-transparent border-none cursor-pointer" />
                      </div>
                      <div className="space-y-1">
                        <label className="flex justify-between text-[8px] font-bold uppercase opacity-50">Pattern Scalar <span>{settings.gridSize}PX</span></label>
                        <input type="range" min="10" max="200" step="10" value={settings.gridSize} onChange={(e) => onSettingsChange({ ...settings, gridSize: parseInt(e.target.value) })} className="w-full h-1 bg-gray-900 appearance-none cursor-pointer accent-current" style={themeStyle} />
                      </div>
                      <div className="space-y-1">
                        <label className="flex justify-between text-[8px] font-bold uppercase opacity-50">Pattern Intensity <span>{(settings.gridOpacity * 100).toFixed(0)}%</span></label>
                        <input type="range" min="0" max="1.0" step="0.01" value={settings.gridOpacity} onChange={(e) => onSettingsChange({ ...settings, gridOpacity: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-900 appearance-none cursor-pointer accent-current" style={themeStyle} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </ConfigSection>

            {/* VISUALS SECTION */}
            <ConfigSection title="Visual Properties" icon={Palette} isOpen={openSections.visuals} toggle={() => toggleSection('visuals')} themeColor={settings.uiColor}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                    <span className="text-[8px] uppercase font-bold opacity-60">OS Primary</span>
                    <input type="color" value={settings.uiColor} onChange={(e) => onSettingsChange({ ...settings, uiColor: e.target.value })} className="w-8 h-6 rounded bg-transparent border-none cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                    <span className="text-[8px] uppercase font-bold opacity-60">Wireframe</span>
                    <input type="color" value={settings.wireframeColor} onChange={(e) => onSettingsChange({ ...settings, wireframeColor: e.target.value })} className="w-8 h-6 rounded bg-transparent border-none cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                    <div className="flex items-center gap-1">
                      <Sun className="w-3 h-3 opacity-50" />
                      <span className="text-[8px] uppercase font-bold opacity-60">Beam Color</span>
                    </div>
                    <input type="color" value={settings.beamColor} onChange={(e) => onSettingsChange({ ...settings, beamColor: e.target.value })} className="w-8 h-6 rounded bg-transparent border-none cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                    <div className="flex items-center gap-1">
                      <Wind className="w-3 h-3 opacity-50" />
                      <span className="text-[8px] uppercase font-bold opacity-60">Trail Color</span>
                    </div>
                    <input type="color" value={settings.trailColor} onChange={(e) => onSettingsChange({ ...settings, trailColor: e.target.value })} className="w-8 h-6 rounded bg-transparent border-none cursor-pointer" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex justify-between text-[8px] font-bold uppercase opacity-50">Beam Caliber <span>{settings.scanlineThickness}PX</span></label>
                  <input type="range" min="1" max="40" step="1" value={settings.scanlineThickness} onChange={(e) => onSettingsChange({ ...settings, scanlineThickness: parseInt(e.target.value) })} className="w-full h-1 bg-gray-900 appearance-none cursor-pointer accent-current" style={themeStyle} />
                </div>

                <div className="space-y-2">
                  <label className="flex justify-between text-[8px] font-bold uppercase opacity-50">Trail Decay <span>{settings.trailLength}VH</span></label>
                  <input type="range" min="5" max="100" step="1" value={settings.trailLength} onChange={(e) => onSettingsChange({ ...settings, trailLength: parseInt(e.target.value) })} className="w-full h-1 bg-gray-900 appearance-none cursor-pointer accent-current" style={themeStyle} />
                </div>
              </div>
            </ConfigSection>

            {/* MOTION SECTION */}
            <ConfigSection title="Kinetic Control" icon={RotateCw} isOpen={openSections.motion} toggle={() => toggleSection('motion')} themeColor={settings.uiColor}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-bold uppercase block opacity-50">Scan Vectors</label>
                  <div className="grid grid-cols-4 gap-1">
                    {directions.map(({ val, icon: Icon }) => (
                      <button 
                        key={val}
                        onClick={() => onSettingsChange({ ...settings, direction: val })}
                        className="flex items-center justify-center p-2 border transition-all"
                        style={{ 
                          backgroundColor: settings.direction === val ? `${settings.uiColor}33` : 'transparent',
                          borderColor: settings.direction === val ? settings.uiColor : `${settings.uiColor}33`,
                          color: settings.direction === val ? settings.uiColor : `${settings.uiColor}66`
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex justify-between text-[8px] font-bold uppercase opacity-50">Spin Rate <span>{settings.spinningSpeed.toFixed(1)}</span></label>
                  <input type="range" min="-5.0" max="5.0" step="0.1" value={settings.spinningSpeed} onChange={(e) => onSettingsChange({ ...settings, spinningSpeed: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-900 appearance-none cursor-pointer accent-current" style={themeStyle} />
                </div>

                <div className="space-y-2">
                  <label className="flex justify-between text-[8px] font-bold uppercase opacity-50">Sweep Velocity <span>{settings.speed.toFixed(1)}</span></label>
                  <input type="range" min="0.1" max="2.0" step="0.1" value={settings.speed} onChange={(e) => onSettingsChange({ ...settings, speed: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-900 appearance-none cursor-pointer accent-current" style={themeStyle} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button className="flex flex-col gap-1 p-2 border text-left transition-all" style={{ backgroundColor: `${settings.uiColor}0d`, borderColor: settings.pingPong ? settings.uiColor : `${settings.uiColor}33` }} onClick={() => onSettingsChange({...settings, pingPong: !settings.pingPong})}>
                    <span className="text-[7px] font-bold uppercase opacity-50">Motion Mode</span>
                    <span className="text-[9px] font-black uppercase">{settings.pingPong ? 'Ping-Pong' : 'Linear'}</span>
                  </button>
                  <button className="flex flex-col gap-1 p-2 border text-left transition-all" style={{ backgroundColor: `${settings.uiColor}0d`, borderColor: settings.autoScan ? settings.uiColor : `${settings.uiColor}33` }} onClick={() => onSettingsChange({...settings, autoScan: !settings.autoScan})}>
                    <span className="text-[7px] font-bold uppercase opacity-50">Auto Initiator</span>
                    <span className="text-[9px] font-black uppercase">{settings.autoScan ? 'Active' : 'Standby'}</span>
                  </button>
                </div>
              </div>
            </ConfigSection>

          </div>
        </div>
      </div>

      {/* Library Panel */}
      <div className={`fixed inset-x-4 md:inset-x-auto md:right-6 top-1/2 -translate-y-1/2 md:w-72 transition-all duration-500 pointer-events-auto z-50 ${showLibrary ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}>
        <div className="bg-black/95 border-r-4 border-magenta-500 p-4 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-magenta-500/30 pb-2">
            <h3 className="text-sm font-black text-magenta-500 uppercase tracking-widest italic">Digital Archive</h3>
            <button onClick={() => setShowLibrary(false)} className="text-magenta-500 hover:text-white text-xl leading-none">×</button>
          </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {MODEL_LIBRARY.map((item) => (
              <button key={item.id} onClick={() => { onSelectLibrary(item.url, 'glb'); setShowLibrary(false); }} className="w-full text-left p-3 border border-magenta-500/20 hover:border-magenta-500 hover:bg-magenta-500/10 transition-all group">
                <div className="text-[8px] text-magenta-500 font-bold mb-1 opacity-50">{item.type} // {item.polyCount} POLYS</div>
                <div className="text-xs font-black text-white group-hover:text-magenta-400 uppercase tracking-tighter">{item.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 md:gap-8 pointer-events-auto">
        {isScanning && (
          <div className="flex items-center gap-3 md:gap-4 border-x-2 px-6 md:px-8 py-2 md:py-3 backdrop-blur-xl animate-pulse" style={{ backgroundColor: `${settings.uiColor}1a`, borderColor: settings.uiColor }}>
            <Cpu className="w-4 h-4 md:w-5 md:h-5" style={themeStyle} />
            <span className="mono text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] md:tracking-[0.4em]" style={themeStyle}>Acquiring Surface Mesh...</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 w-full max-w-xl">
          <button onClick={onScan} className="cyber-button relative w-full h-16 md:h-20 text-lg md:text-2xl font-black uppercase tracking-[0.3em] md:tracking-[0.5em] transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: isScanning ? '#ff00ff' : settings.uiColor, color: isScanning ? 'white' : 'black', boxShadow: `0 0 40px ${isScanning ? '#ff00ff66' : settings.uiColor + '66'}` }}>
            <div className="flex items-center justify-center gap-4">
              <Scan className={`w-6 h-6 md:w-8 md:h-8 ${isScanning ? 'animate-pulse' : ''}`} />
              {isScanning ? 'Halt Process' : 'Initiate Scan'}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
