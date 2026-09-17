import React, { useState } from 'react';
import { ArrowLeftRight, ChevronDown, Plus, Palette as PaletteIcon } from 'lucide-react';
import { PALETTES, getPaletteById } from '../utils/palettes';
import { soundEngine } from '../utils/audio';

interface PaletteSelectorProps {
  currentPaletteId: string;
  primaryColor: string;
  secondaryColor: string;
  recentColors: string[];
  onChangePalette: (paletteId: string) => void;
  onSelectPrimaryColor: (color: string) => void;
  onSelectSecondaryColor: (color: string) => void;
  onSwapColors: () => void;
}

export const PaletteSelector: React.FC<PaletteSelectorProps> = ({
  currentPaletteId,
  primaryColor,
  secondaryColor,
  recentColors,
  onChangePalette,
  onSelectPrimaryColor,
  onSelectSecondaryColor,
  onSwapColors,
}) => {
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const [customHex, setCustomHex] = useState('#ffffff');
  const palette = getPaletteById(currentPaletteId);

  const handleColorClick = (color: string, e: React.MouseEvent) => {
    soundEngine.playPixelDraw();
    if (e.button === 2 || e.shiftKey) {
      onSelectSecondaryColor(color);
    } else {
      onSelectPrimaryColor(color);
    }
  };

  const handleApplyCustomHex = () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(customHex)) {
      onSelectPrimaryColor(customHex);
      soundEngine.playPixelDraw();
    }
  };

  return (
    <div className="bg-[#111111] border border-[#222222] p-3 shadow-xl flex flex-col gap-3">
      {/* Top Header: Palette Switcher & Color Wells */}
      <div className="flex items-center justify-between gap-3">
        {/* Palette Dropdown Selector */}
        <div className="relative">
          <button
            id="btn-palette-dropdown"
            onClick={() => setShowPaletteMenu(!showPaletteMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#161616] hover:bg-[#202020] border border-[#2A2A2A] text-xs font-black uppercase tracking-wider text-white transition-colors"
          >
            <PaletteIcon className="w-3.5 h-3.5 text-blue-400" />
            <span className="max-w-[120px] truncate">{palette.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {showPaletteMenu && (
            <div className="absolute left-0 bottom-full mb-2 w-60 bg-[#0D0D0D] border border-[#333] p-2 shadow-2xl z-40 space-y-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black px-2 py-1">
                PALETTE PRESETS
              </div>
              {PALETTES.map((pal) => (
                <button
                  key={pal.id}
                  onClick={() => {
                    onChangePalette(pal.id);
                    setShowPaletteMenu(false);
                    soundEngine.playJoin();
                  }}
                  className={`w-full p-2 text-left text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
                    pal.id === currentPaletteId
                      ? 'bg-white text-black font-black'
                      : 'text-neutral-300 hover:bg-[#1C1C1C]'
                  }`}
                >
                  <span>{pal.name}</span>
                  <div className="flex gap-0.5">
                    {pal.colors.slice(0, 4).map((c, i) => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary & Secondary Color Wells */}
        <div className="flex items-center gap-2">
          {/* Primary Color Box */}
          <div
            title={`Primary Color (Left Click): ${primaryColor}`}
            className="w-8 h-8 border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-105 relative"
            style={{ backgroundColor: primaryColor }}
          />

          {/* Swap Button */}
          <button
            onClick={onSwapColors}
            title="Swap Primary & Secondary (Key: X)"
            className="p-1 text-neutral-400 hover:text-white hover:bg-[#1A1A1A] transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          {/* Secondary Color Box */}
          <div
            title={`Secondary Color (Right Click): ${secondaryColor}`}
            className="w-7 h-7 border border-[#444] shadow cursor-pointer transition-transform hover:scale-105"
            style={{ backgroundColor: secondaryColor }}
          />
        </div>
      </div>

      {/* Palette Color Swatches Grid */}
      <div className="grid grid-cols-8 gap-1.5">
        {palette.colors.map((col, idx) => {
          const isSelected = primaryColor.toLowerCase() === col.toLowerCase();
          const isSecondary = secondaryColor.toLowerCase() === col.toLowerCase();

          return (
            <button
              key={`${col}-${idx}`}
              onMouseDown={(e) => handleColorClick(col, e)}
              onContextMenu={(e) => {
                e.preventDefault();
                onSelectSecondaryColor(col);
                soundEngine.playPixelDraw();
              }}
              title={`${col} (Left: Primary, Right: Secondary)`}
              className={`w-full aspect-square transition-all relative ${
                isSelected
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105 z-10'
                  : isSecondary
                  ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-black'
                  : 'border border-black/40 hover:scale-105'
              }`}
              style={{ backgroundColor: col }}
            />
          );
        })}
      </div>

      {/* Bottom Row: Custom Hex Input & Recent Colors */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#222222]">
        {/* Recent Colors */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[10px] text-neutral-500 font-mono-code font-bold uppercase tracking-wider mr-1">RECENT:</span>
          {recentColors.slice(0, 7).map((c, i) => (
            <button
              key={i}
              onClick={() => onSelectPrimaryColor(c)}
              title={c}
              className="w-4 h-4 border border-[#333] hover:scale-110 transition-transform flex-shrink-0"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Custom Hex Picker */}
        <div className="flex items-center gap-1">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => onSelectPrimaryColor(e.target.value)}
            className="w-6 h-6 cursor-pointer bg-transparent border-0"
            title="Open native color picker"
          />
        </div>
      </div>
    </div>
  );
};
