import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Users, 
  Lock, 
  Globe, 
  Clock, 
  RotateCcw, 
  Palette as PaletteIcon, 
  Grid,
  Zap,
  HelpCircle
} from 'lucide-react';
import { GameMode } from '../types/game';
import { PALETTES } from '../utils/palettes';
import { soundEngine } from '../utils/audio';

interface CreateLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: {
    name: string;
    gameMode: GameMode;
    gridSize: number;
    maxPlayers: number;
    isPrivate: boolean;
    paletteId: string;
    roundTime: number;
    totalRounds: number;
  }) => void;
}

export const CreateLobbyModal: React.FC<CreateLobbyModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('My Pixel Lounge');
  const [gameMode, setGameMode] = useState<GameMode>('collab');
  const [gridSize, setGridSize] = useState<number>(32);
  const [maxPlayers, setMaxPlayers] = useState<number>(8);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [paletteId, setPaletteId] = useState<string>('pico-8');
  const [roundTime, setRoundTime] = useState<number>(60);
  const [totalRounds, setTotalRounds] = useState<number>(3);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playRoundStart();
    onCreate({
      name: name.trim() || 'Pixel Lounge',
      gameMode,
      gridSize,
      maxPlayers,
      isPrivate,
      paletteId,
      roundTime,
      totalRounds,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111111] border border-[#333333] p-5 sm:p-7 max-w-xl w-full shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#222222]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                CREATE LOBBY
              </h2>
              <p className="text-xs text-neutral-400 font-mono-code font-bold uppercase tracking-wider">
                CONFIGURE ROOM RULES & CANVAS
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Lobby Name */}
          <div>
            <label className="block text-xs font-black text-neutral-300 mb-1.5 uppercase tracking-wider">
              LOBBY NAME
            </label>
            <input
              type="text"
              required
              maxLength={28}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.G. CYBERPUNK ARCADE"
              className="w-full bg-[#161616] border border-[#333] focus:border-white px-3.5 py-2.5 text-sm text-white focus:outline-none uppercase tracking-wider font-medium"
            />
          </div>

          {/* Game Mode Cards */}
          <div>
            <label className="block text-xs font-black text-neutral-300 mb-2 uppercase tracking-wider">
              GAME MODE
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Collab Sandbox */}
              <button
                type="button"
                onClick={() => setGameMode('collab')}
                className={`p-3.5 border text-left transition-all relative overflow-hidden ${
                  gameMode === 'collab'
                    ? 'bg-white text-black font-black border-white shadow-lg'
                    : 'bg-[#161616] border-[#262626] text-neutral-300 hover:border-[#444]'
                }`}
              >
                <span className="text-2xl mb-1 block">🎨</span>
                <h4 className="text-xs font-black uppercase tracking-wider">FREE COLLAB</h4>
                <p className={`text-[11px] mt-1 leading-tight ${gameMode === 'collab' ? 'text-neutral-800' : 'text-neutral-400'}`}>
                  Open canvas. Draw freely together with live cursors & chat.
                </p>
              </button>

              {/* Pixel Guess */}
              <button
                type="button"
                onClick={() => setGameMode('guess')}
                className={`p-3.5 border text-left transition-all relative overflow-hidden ${
                  gameMode === 'guess'
                    ? 'bg-white text-black font-black border-white shadow-lg'
                    : 'bg-[#161616] border-[#262626] text-neutral-300 hover:border-[#444]'
                }`}
              >
                <span className="text-2xl mb-1 block">🎯</span>
                <h4 className="text-xs font-black uppercase tracking-wider">GUESS & DRAW</h4>
                <p className={`text-[11px] mt-1 leading-tight ${gameMode === 'guess' ? 'text-neutral-800' : 'text-neutral-400'}`}>
                  Take turns drawing secret pixel words. Others guess for points!
                </p>
              </button>

              {/* Speed Battle */}
              <button
                type="button"
                onClick={() => setGameMode('speed_battle')}
                className={`p-3.5 border text-left transition-all relative overflow-hidden ${
                  gameMode === 'speed_battle'
                    ? 'bg-white text-black font-black border-white shadow-lg'
                    : 'bg-[#161616] border-[#262626] text-neutral-300 hover:border-[#444]'
                }`}
              >
                <span className="text-2xl mb-1 block">⚡</span>
                <h4 className="text-xs font-black uppercase tracking-wider">SPEED BATTLE</h4>
                <p className={`text-[11px] mt-1 leading-tight ${gameMode === 'speed_battle' ? 'text-neutral-800' : 'text-neutral-400'}`}>
                  Everyone draws the same theme in 60s, then vote for the winner!
                </p>
              </button>
            </div>
          </div>

          {/* Grid Size & Privacy row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Grid Size */}
            <div>
              <label className="block text-xs font-black text-neutral-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-blue-400" />
                CANVAS GRID SIZE
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { size: 16, label: '16×16', desc: 'MINI' },
                  { size: 24, label: '24×24', desc: 'SPRITE' },
                  { size: 32, label: '32×32', desc: 'ARCADE' },
                  { size: 48, label: '48×48', desc: 'DETAIL' },
                ].map((item) => (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => setGridSize(item.size)}
                    className={`py-2 px-1 text-center border text-xs transition-all ${
                      gridSize === item.size
                        ? 'bg-blue-600 text-white font-black border-blue-500'
                        : 'bg-[#161616] border-[#262626] text-neutral-400 hover:border-[#444]'
                    }`}
                  >
                    <div className="font-mono-code font-bold">{item.label}</div>
                    <div className="text-[9px] text-neutral-400 uppercase font-mono-code">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-xs font-black text-neutral-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                {isPrivate ? <Lock className="w-3.5 h-3.5 text-pink-400" /> : <Globe className="w-3.5 h-3.5 text-emerald-400" />}
                LOBBY PRIVACY
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`py-2.5 px-3 border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    !isPrivate
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-[#161616] border-[#262626] text-neutral-400 hover:border-[#444]'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  PUBLIC
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`py-2.5 px-3 border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isPrivate
                      ? 'bg-pink-600 text-white border-pink-500'
                      : 'bg-[#161616] border-[#262626] text-neutral-400 hover:border-[#444]'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  PRIVATE
                </button>
              </div>
            </div>
          </div>

          {/* Palette Preset Selection */}
          <div>
            <label className="block text-xs font-black text-neutral-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <PaletteIcon className="w-3.5 h-3.5 text-amber-400" />
              STARTING PALETTE
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PALETTES.map((pal) => (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => setPaletteId(pal.id)}
                  className={`p-2.5 border text-left transition-all ${
                    paletteId === pal.id
                      ? 'bg-white text-black font-black border-white'
                      : 'bg-[#161616] border-[#262626] text-neutral-300 hover:border-[#444]'
                  }`}
                >
                  <div className="text-[11px] font-black uppercase tracking-wider truncate">
                    {pal.name}
                  </div>
                  {/* Swatches preview */}
                  <div className="flex gap-0.5 mt-1.5 overflow-hidden">
                    {pal.colors.slice(0, 6).map((c, i) => (
                      <div
                        key={i}
                        className="w-3.5 h-2.5 flex-1"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Specific Settings (Rounds & Timer for Guess/Battle) */}
          {gameMode !== 'collab' && (
            <div className="grid grid-cols-2 gap-4 p-3.5 bg-[#0D0D0D] border border-[#222222]">
              <div>
                <label className="block text-[11px] font-mono-code font-bold uppercase tracking-wider text-neutral-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  DRAW TIME: {roundTime}S
                </label>
                <input
                  type="range"
                  min={30}
                  max={120}
                  step={15}
                  value={roundTime}
                  onChange={(e) => setRoundTime(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono-code font-bold uppercase tracking-wider text-neutral-300 mb-1 flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-pink-400" />
                  TOTAL ROUNDS: {totalRounds}
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={totalRounds}
                  onChange={(e) => setTotalRounds(Number(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-black uppercase tracking-wider text-neutral-400 hover:text-white"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-neutral-200 shadow-xl transition-all active:translate-y-0.5"
            >
              LAUNCH LOBBY 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
