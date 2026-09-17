import React from 'react';
import { X, HelpCircle, Sparkles, Keyboard, Trophy, Palette, Grid } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#111111] border border-[#333333] p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#222222]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                PIXEL PARTY GUIDE
              </h2>
              <p className="text-xs text-neutral-400 font-mono-code font-bold uppercase tracking-wider">
                MASTER MODES, TOOLS & MULTIPLAYER LOBBIES
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-xs text-neutral-300">
          {/* Section 1: Game Modes */}
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              GAME MODES
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#0D0D0D] border border-[#222222]">
                <div className="text-xl mb-1">🎨</div>
                <h4 className="font-black text-white uppercase tracking-wider mb-1">FREE COLLAB</h4>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Open collaborative sandbox. Draw with everyone simultaneously with live colored cursors.
                </p>
              </div>

              <div className="p-3.5 bg-[#0D0D0D] border border-[#222222]">
                <div className="text-xl mb-1">🎯</div>
                <h4 className="font-black text-white uppercase tracking-wider mb-1">GUESS & DRAW</h4>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Turn-based Pictionary! One drawer paints the secret word, others guess in chat for high scores.
                </p>
              </div>

              <div className="p-3.5 bg-[#0D0D0D] border border-[#222222]">
                <div className="text-xl mb-1">⚡</div>
                <h4 className="font-black text-white uppercase tracking-wider mb-1">SPEED BATTLE</h4>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Everyone receives the same themed prompt. You have 60 seconds to draw, then vote for the best sprite!
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Drawing Tools & Pro Tips */}
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-400" />
              PRO TOOLS & SHADING
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#0D0D0D] border border-[#222222]">
                <h4 className="font-black text-blue-400 uppercase tracking-wider mb-1">🪄 DITHER SHADING</h4>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  The dither tool applies an authentic retro checkerboard stipple, blending 2 colors seamlessly.
                </p>
              </div>

              <div className="p-3.5 bg-[#0D0D0D] border border-[#222222]">
                <h4 className="font-black text-pink-400 uppercase tracking-wider mb-1">🪞 MIRROR SYMMETRY</h4>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Turn on Horizontal (X) or Quad (4X) symmetry to paint faces, spaceship sprites, and badges in half the time!
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Keyboard Shortcuts */}
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-blue-400" />
              KEYBOARD SHORTCUTS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-code">
              {[
                { key: 'P', desc: 'PENCIL' },
                { key: 'E', desc: 'ERASER' },
                { key: 'B', desc: 'BUCKET FILL' },
                { key: 'I', desc: 'EYEDROPPER' },
                { key: 'L', desc: 'LINE TOOL' },
                { key: 'R', desc: 'RECTANGLE' },
                { key: 'C', desc: 'CIRCLE' },
                { key: 'X', desc: 'SWAP COLORS' },
                { key: 'CTRL+Z', desc: 'UNDO' },
                { key: 'CTRL+Y', desc: 'REDO' },
                { key: '+ / -', desc: 'ZOOM IN/OUT' },
                { key: '0', desc: 'RESET ZOOM' },
              ].map((sc, i) => (
                <div
                  key={i}
                  className="p-2 bg-[#0D0D0D] border border-[#222222] flex items-center justify-between"
                >
                  <span className="bg-[#1C1C1C] px-1.5 py-0.5 text-amber-300 font-bold text-[10px]">
                    {sc.key}
                  </span>
                  <span className="text-neutral-400 text-[11px] font-bold">{sc.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-[#222222] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white hover:bg-neutral-200 text-black font-black uppercase text-xs tracking-wider shadow-lg transition-transform active:translate-y-0.5"
          >
            LET&apos;S DRAW!
          </button>
        </div>
      </div>
    </div>
  );
};
