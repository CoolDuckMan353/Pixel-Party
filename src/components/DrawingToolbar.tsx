import React from 'react';
import { 
  Pencil, 
  Eraser, 
  PaintBucket, 
  Pipette, 
  Minus, 
  Square, 
  Circle, 
  Sparkles, 
  Sun, 
  Moon, 
  Undo2, 
  Redo2, 
  Trash2, 
  Grid, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  SplitSquareVertical,
  Download,
  Share2
} from 'lucide-react';
import { ToolType } from '../types/game';
import { soundEngine } from '../utils/audio';

interface DrawingToolbarProps {
  activeTool: ToolType;
  brushSize: number;
  gridType: 'none' | 'subtle' | 'dots' | 'clear';
  symmetryMode: 'none' | 'horizontal' | 'vertical' | 'quad';
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onSelectTool: (tool: ToolType) => void;
  onChangeBrushSize: (size: number) => void;
  onToggleGrid: () => void;
  onToggleSymmetry: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearCanvas: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onOpenExport: () => void;
  disabled?: boolean;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  activeTool,
  brushSize,
  gridType,
  symmetryMode,
  canUndo,
  canRedo,
  zoom,
  onSelectTool,
  onChangeBrushSize,
  onToggleGrid,
  onToggleSymmetry,
  onUndo,
  onRedo,
  onClearCanvas,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onOpenExport,
  disabled = false,
}) => {
  const tools: { id: ToolType; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { id: 'pencil', label: 'Pencil', icon: <Pencil className="w-4 h-4" />, shortcut: 'P' },
    { id: 'eraser', label: 'Eraser', icon: <Eraser className="w-4 h-4" />, shortcut: 'E' },
    { id: 'bucket', label: 'Bucket Fill', icon: <PaintBucket className="w-4 h-4" />, shortcut: 'B' },
    { id: 'eyedropper', label: 'Color Picker', icon: <Pipette className="w-4 h-4" />, shortcut: 'I' },
    { id: 'line', label: 'Line Tool', icon: <Minus className="w-4 h-4" />, shortcut: 'L' },
    { id: 'rect', label: 'Rectangle (Frame)', icon: <Square className="w-4 h-4" />, shortcut: 'R' },
    { id: 'rect_filled', label: 'Rectangle (Fill)', icon: <div className="w-3.5 h-3.5 bg-current rounded-xs" />, shortcut: 'Shift+R' },
    { id: 'circle', label: 'Circle (Frame)', icon: <Circle className="w-4 h-4" />, shortcut: 'C' },
    { id: 'circle_filled', label: 'Circle (Fill)', icon: <div className="w-3.5 h-3.5 bg-current rounded-full" />, shortcut: 'Shift+C' },
    { id: 'dither', label: 'Dither Shading', icon: <Sparkles className="w-4 h-4" />, shortcut: 'D' },
    { id: 'shade_light', label: 'Lighten (+15%)', icon: <Sun className="w-4 h-4" />, shortcut: 'U' },
    { id: 'shade_dark', label: 'Darken (-15%)', icon: <Moon className="w-4 h-4" />, shortcut: 'J' },
  ];

  const handleToolClick = (tool: ToolType) => {
    soundEngine.playPixelDraw();
    onSelectTool(tool);
  };

  const getSymmetryLabel = () => {
    switch (symmetryMode) {
      case 'horizontal': return 'Sym: X';
      case 'vertical': return 'Sym: Y';
      case 'quad': return 'Sym: 4X';
      default: return 'Symmetry';
    }
  };

  return (
    <div className={`bg-[#111111] border border-[#222222] p-2.5 flex flex-wrap lg:flex-col gap-2 items-center shadow-2xl ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      {/* Primary Tools Grid */}
      <div className="grid grid-cols-6 lg:grid-cols-2 gap-1.5 w-full">
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              id={`btn-tool-${t.id}`}
              onClick={() => handleToolClick(t.id)}
              title={`${t.label} (${t.shortcut})`}
              className={`p-2.5 transition-all flex items-center justify-center relative ${
                isActive
                  ? 'bg-white text-black font-black shadow-md'
                  : 'bg-[#181818] border border-[#262626] text-neutral-400 hover:text-white hover:border-[#444]'
              }`}
            >
              {t.icon}
            </button>
          );
        })}
      </div>

      <div className="h-px w-full bg-[#222222] my-0.5 hidden lg:block" />

      {/* Brush Size Selector */}
      <div className="flex lg:flex-col gap-1 items-center bg-[#0D0D0D] p-1 border border-[#222222]">
        {[1, 2, 3, 4].map((size) => (
          <button
            key={size}
            onClick={() => {
              soundEngine.playPixelDraw();
              onChangeBrushSize(size);
            }}
            title={`Brush Size: ${size}px`}
            className={`w-6 h-6 flex items-center justify-center text-xs font-mono-code transition-all ${
              brushSize === size
                ? 'bg-blue-600 text-white font-black'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      <div className="h-px w-full bg-[#222222] my-0.5 hidden lg:block" />

      {/* Symmetry & Grid toggles */}
      <div className="flex lg:flex-col gap-1 items-center">
        {/* Symmetry Toggle */}
        <button
          onClick={() => {
            soundEngine.playJoin();
            onToggleSymmetry();
          }}
          title={`Mirror Symmetry Mode (${symmetryMode})`}
          className={`p-2 border transition-all text-xs flex items-center gap-1 ${
            symmetryMode !== 'none'
              ? 'bg-pink-600 text-white border-pink-500 font-bold'
              : 'border-[#262626] bg-[#161616] text-neutral-400 hover:text-white hover:border-[#444]'
          }`}
        >
          <SplitSquareVertical className="w-4 h-4" />
        </button>

        {/* Grid Style Toggle */}
        <button
          onClick={() => {
            soundEngine.playJoin();
            onToggleGrid();
          }}
          title={`Grid Overlay: ${gridType}`}
          className={`p-2 border transition-all ${
            gridType !== 'none'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'border-[#262626] bg-[#161616] text-neutral-400 hover:text-white hover:border-[#444]'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>
      </div>

      <div className="h-px w-full bg-[#222222] my-0.5 hidden lg:block" />

      {/* Undo / Redo */}
      <div className="flex lg:flex-col gap-1 items-center">
        <button
          id="btn-undo"
          onClick={() => {
            soundEngine.playUndo();
            onUndo();
          }}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-2 bg-[#161616] border border-[#262626] text-neutral-400 hover:text-white hover:border-[#444] disabled:opacity-20 disabled:hover:border-[#262626] transition-all"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          id="btn-redo"
          onClick={() => {
            soundEngine.playPixelDraw();
            onRedo();
          }}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-2 bg-[#161616] border border-[#262626] text-neutral-400 hover:text-white hover:border-[#444] disabled:opacity-20 disabled:hover:border-[#262626] transition-all"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="h-px w-full bg-[#222222] my-0.5 hidden lg:block" />

      {/* Zoom Controls */}
      <div className="flex lg:flex-col gap-1 items-center bg-[#0D0D0D] p-1 border border-[#222222]">
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-1 text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onResetZoom}
          title="Reset Zoom (100%)"
          className="text-[10px] font-mono-code font-bold text-neutral-300 hover:text-white px-1"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-1 text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-px w-full bg-[#222222] my-0.5 hidden lg:block" />

      {/* Clear & Export */}
      <div className="flex lg:flex-col gap-1 items-center">
        <button
          id="btn-clear-canvas"
          onClick={() => {
            if (window.confirm('Clear the entire canvas?')) {
              soundEngine.playUndo();
              onClearCanvas();
            }
          }}
          title="Clear Canvas"
          className="p-2 text-red-400 hover:text-white bg-red-950/30 hover:bg-red-900/60 border border-red-900/50 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          id="btn-export-art"
          onClick={onOpenExport}
          title="Export / Download Pixel Art PNG"
          className="p-2 bg-white text-black hover:bg-neutral-200 transition-all shadow-md active:translate-y-0.5"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
