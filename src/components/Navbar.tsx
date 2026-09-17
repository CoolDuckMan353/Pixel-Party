import React, { useState } from 'react';
import { 
  Palette, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Home, 
  FolderHeart, 
  User, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Player } from '../types/game';
import { soundEngine } from '../utils/audio';

interface NavbarProps {
  currentLobbyId: string | null;
  lobbyName?: string;
  player: Player;
  onUpdatePlayer: (updated: Partial<Player>) => void;
  onLeaveLobby: () => void;
  onOpenGallery: () => void;
  onOpenHelp: () => void;
}

const AVATAR_OPTIONS = ['🎨', '👾', '🦊', '🐱', '🐸', '🚀', '⭐', '🦄', '🤖', '👑', '🍕', '💎'];
const COLOR_OPTIONS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];

export const Navbar: React.FC<NavbarProps> = ({
  currentLobbyId,
  lobbyName,
  player,
  onUpdatePlayer,
  onLeaveLobby,
  onOpenGallery,
  onOpenHelp,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempName, setTempName] = useState(player.name);
  const [tempAvatar, setTempAvatar] = useState(player.avatar);
  const [tempColor, setTempColor] = useState(player.color);

  const handleCopyCode = () => {
    if (!currentLobbyId) return;
    navigator.clipboard.writeText(currentLobbyId);
    setCopied(true);
    soundEngine.playJoin();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEngine.playPixelDraw();
    }
  };

  const handleSaveProfile = () => {
    if (tempName.trim()) {
      onUpdatePlayer({
        name: tempName.trim().slice(0, 16),
        avatar: tempAvatar,
        color: tempColor,
      });
      soundEngine.playJoin();
    }
    setShowProfileModal(false);
  };

  return (
    <header className="bg-[#0A0A0A] border-b border-[#222] px-4 sm:px-8 py-3.5 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Lobby Title */}
      <div className="flex items-center gap-4">
        <button
          id="btn-logo-home"
          onClick={currentLobbyId ? onLeaveLobby : undefined}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black tracking-tighter text-xl shadow-md group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-white accent-glow">
                PIXEL PARTY
              </span>
              <span className="font-mono-code text-[10px] text-blue-500 font-bold bg-blue-950/40 border border-blue-800/60 px-1.5 py-0.5">
                V2.4.0
              </span>
            </div>
            {lobbyName && currentLobbyId ? (
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider truncate max-w-[140px] sm:max-w-[240px]">
                {lobbyName}
              </p>
            ) : (
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold hidden sm:block">
                MULTICOLOR CANVAS ENGINE
              </p>
            )}
          </div>
        </button>

        {/* Room Code Badge (when in lobby) */}
        {currentLobbyId && (
          <button
            id="btn-copy-room-code"
            onClick={handleCopyCode}
            title="Click to copy room code"
            className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] border border-[#333] hover:border-blue-500 text-xs font-mono-code font-bold text-white transition-all"
          >
            <span className="text-[10px] text-neutral-400 font-sans uppercase tracking-wider">ROOM:</span>
            <span className="font-pixel text-blue-400 font-black">{currentLobbyId}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-neutral-400" />
            )}
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Saved Gallery */}
        <button
          id="btn-open-gallery"
          onClick={onOpenGallery}
          title="Saved Pixel Art Gallery"
          className="px-3 py-2 text-neutral-300 hover:text-white bg-[#141414] hover:bg-[#202020] border border-[#2A2A2A] transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider"
        >
          <FolderHeart className="w-4 h-4 text-pink-500" />
          <span className="hidden md:inline">Gallery</span>
        </button>

        {/* How to Play Guide */}
        <button
          id="btn-open-help"
          onClick={onOpenHelp}
          title="How to Play & Game Modes"
          className="p-2 text-neutral-300 hover:text-white bg-[#141414] hover:bg-[#202020] border border-[#2A2A2A] transition-all"
        >
          <HelpCircle className="w-4 h-4 text-blue-400" />
        </button>

        {/* Sound Toggle */}
        <button
          id="btn-toggle-sound"
          onClick={handleToggleSound}
          title={isMuted ? 'Unmute 8-Bit Sounds' : 'Mute Sounds'}
          className={`p-2 border transition-all ${
            isMuted
              ? 'bg-[#141414] border-[#2A2A2A] text-neutral-600'
              : 'bg-blue-950/30 border-blue-600/50 text-blue-400 hover:bg-blue-900/40'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Player Profile Button */}
        <button
          id="btn-player-profile"
          onClick={() => {
            setTempName(player.name);
            setTempAvatar(player.avatar);
            setTempColor(player.color);
            setShowProfileModal(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] border border-[#333] transition-all text-xs font-black uppercase tracking-wider"
          style={{ borderColor: `${player.color}66` }}
        >
          <span className="text-base leading-none">{player.avatar}</span>
          <span className="max-w-[80px] sm:max-w-[120px] truncate text-white">
            {player.name}
          </span>
          <div
            className="w-2.5 h-2.5"
            style={{ backgroundColor: player.color }}
          />
        </button>

        {/* Leave Lobby Button */}
        {currentLobbyId && (
          <button
            id="btn-leave-lobby"
            onClick={onLeaveLobby}
            title="Leave current lobby"
            className="p-2 text-red-400 hover:text-white bg-red-950/30 hover:bg-red-900/80 border border-red-900/60 transition-all font-black uppercase text-xs"
          >
            <Home className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#0D0D0D] border border-[#333] p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="mb-6 pb-4 border-b border-[#222]">
              <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-black mb-1">
                PROFILE SETTINGS
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Customize Artist
              </h3>
            </div>

            {/* Name Input */}
            <div className="mb-5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2">
                Artist Handle
              </label>
              <input
                type="text"
                value={tempName}
                maxLength={16}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="ENTER NAME"
                className="w-full bg-[#161616] border border-[#333] focus:border-blue-500 px-4 py-2.5 text-sm font-bold uppercase text-white focus:outline-none"
              />
            </div>

            {/* Avatar Selector */}
            <div className="mb-5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2">
                Select Avatar Emoji
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setTempAvatar(emoji)}
                    className={`text-xl p-2.5 border transition-all ${
                      tempAvatar === emoji
                        ? 'bg-blue-600/30 border-blue-500 scale-105'
                        : 'bg-[#141414] border-[#252525] hover:border-[#444]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Cursor / Name Tag Color */}
            <div className="mb-6">
              <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-2">
                Cursor & Accent Tint
              </label>
              <div className="grid grid-cols-8 gap-2">
                {COLOR_OPTIONS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setTempColor(col)}
                    className={`w-8 h-8 transition-transform ${
                      tempColor === col
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222]">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-neutral-400 hover:text-white border border-transparent hover:border-[#333]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-neutral-200 transition-colors shadow-lg"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
