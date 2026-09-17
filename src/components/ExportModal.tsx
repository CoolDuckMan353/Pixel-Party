import React, { useState } from 'react';
import { X, Download, Copy, Check, FolderHeart, Sparkles, Image as ImageIcon } from 'lucide-react';
import { exportCanvasToDataUrl } from '../utils/drawing';
import { SavedPixelArt } from '../types/game';
import { soundEngine } from '../utils/audio';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasPixels: string[];
  gridSize: number;
  authorName: string;
  gameMode: string;
  onSaveToGallery: (art: SavedPixelArt) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasPixels,
  gridSize,
  authorName,
  gameMode,
  onSaveToGallery,
}) => {
  const [scale, setScale] = useState<number>(16);
  const [transparentBg, setTransparentBg] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('My Pixel Art');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  if (!isOpen) return null;

  const previewUrl = exportCanvasToDataUrl(canvasPixels, gridSize, scale, transparentBg);

  const handleDownload = () => {
    soundEngine.playRoundStart();
    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${gridSize}x${gridSize}.png`;
    link.href = previewUrl;
    link.click();
  };

  const handleSaveGallery = () => {
    soundEngine.playCorrectGuess();
    const newArt: SavedPixelArt = {
      id: 'art-' + Date.now(),
      title: title.trim() || 'Untitled Pixel Art',
      gridSize,
      pixels: [...canvasPixels],
      createdAt: Date.now(),
      author: authorName,
      mode: gameMode,
    };
    onSaveToGallery(newArt);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#111111] border border-[#333333] p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              EXPORT PIXEL ART
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white hover:bg-[#222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Art Preview Box */}
        <div className="w-56 h-56 mx-auto bg-[#050505] border border-[#222222] overflow-hidden p-3 flex items-center justify-center mb-5">
          <img
            src={previewUrl}
            alt="Preview"
            className="pixelated max-w-full max-h-full object-contain"
          />
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-xs font-black text-neutral-300 mb-1 uppercase tracking-wider">
            ARTWORK TITLE
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#161616] border border-[#333] px-3 py-2 text-xs text-white uppercase tracking-wider font-medium focus:outline-none focus:border-white"
          />
        </div>

        {/* Scale & Transparency Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="block text-xs font-black text-neutral-300 mb-1 uppercase tracking-wider">
              RESOLUTION SCALE
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[4, 8, 16].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScale(s)}
                  className={`py-1.5 border text-xs font-mono-code font-bold transition-colors ${
                    scale === s
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-[#161616] border-[#262626] text-neutral-400 hover:border-[#444]'
                  }`}
                >
                  {s}X
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-neutral-300 mb-1 uppercase tracking-wider">
              BACKGROUND
            </label>
            <button
              type="button"
              onClick={() => setTransparentBg(!transparentBg)}
              className={`w-full py-1.5 px-2 border text-xs font-black uppercase tracking-wider transition-colors ${
                transparentBg
                  ? 'bg-pink-600 border-pink-500 text-white'
                  : 'bg-[#161616] border-[#262626] text-neutral-300'
              }`}
            >
              {transparentBg ? 'TRANSPARENT PNG' : 'SOLID DARK'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleDownload}
            className="w-full py-2.5 bg-white hover:bg-neutral-200 text-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-xl transition-transform active:translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD PNG FILE
          </button>

          <button
            onClick={handleSaveGallery}
            className="w-full py-2 bg-[#161616] hover:bg-[#202020] text-neutral-200 border border-[#2A2A2A] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">SAVED TO GALLERY!</span>
              </>
            ) : (
              <>
                <FolderHeart className="w-4 h-4 text-pink-400" />
                SAVE TO IN-APP GALLERY
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
