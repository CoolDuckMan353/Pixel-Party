import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  Search, 
  Sparkles, 
  Play, 
  RefreshCw, 
  Grid, 
  Lock, 
  Globe, 
  ArrowRight,
  Palette as PaletteIcon,
  HelpCircle,
  Trophy,
  Flame
} from 'lucide-react';
import { LobbySummary, GameMode } from '../types/game';
import { soundEngine } from '../utils/audio';

interface LobbyBrowserProps {
  onJoinLobby: (lobbyId: string) => void;
  onOpenCreateModal: () => void;
  onOpenSoloStudio: () => void;
  onOpenHelp: () => void;
}

export const LobbyBrowser: React.FC<LobbyBrowserProps> = ({
  onJoinLobby,
  onOpenCreateModal,
  onOpenSoloStudio,
  onOpenHelp,
}) => {
  const [lobbies, setLobbies] = useState<LobbySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | GameMode>('all');

  const fetchLobbies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lobbies');
      if (res.ok) {
        const data = await res.json();
        setLobbies(data);
      }
    } catch (err) {
      console.error('Failed to load lobbies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLobbies();
    const interval = setInterval(fetchLobbies, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (cleanCode) {
      soundEngine.playJoin();
      onJoinLobby(cleanCode);
    }
  };

  const handleQuickPlay = () => {
    soundEngine.playRoundStart();
    // Prefer lobby with players or public lounge
    const withPlayers = lobbies.find((l) => l.playerCount > 0 && l.playerCount < l.maxPlayers);
    if (withPlayers) {
      onJoinLobby(withPlayers.id);
    } else if (lobbies.length > 0) {
      onJoinLobby(lobbies[0].id);
    } else {
      onJoinLobby('PUBLIC-LOUNGE');
    }
  };

  const filteredLobbies = lobbies.filter((l) => {
    const matchesFilter = selectedFilter === 'all' || l.gameMode === selectedFilter;
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getModeBadge = (mode: GameMode) => {
    switch (mode) {
      case 'collab':
        return { label: 'FREE COLLAB', color: 'bg-blue-600 text-white font-black', icon: '🎨' };
      case 'guess':
        return { label: 'GUESS & DRAW', color: 'bg-purple-600 text-white font-black', icon: '🎯' };
      case 'speed_battle':
        return { label: 'SPEED BATTLE', color: 'bg-amber-600 text-white font-black', icon: '⚡' };
      case 'relay':
        return { label: 'RELAY ART', color: 'bg-emerald-600 text-white font-black', icon: '🔄' };
      default:
        return { label: 'MULTIPLAYER', color: 'bg-neutral-700 text-white font-black', icon: '🎮' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero Arcade Section */}
      <div className="relative overflow-hidden bg-[#111111] border border-[#222222] p-6 sm:p-10 mb-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="text-[11px] uppercase tracking-[0.3em] text-neutral-500 font-black mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 inline-block"></span>
              REAL-TIME PIXEL ENGINE • MULTIPLAYER ARENA
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none text-white mb-4">
              DRAW. GUESS. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-500 italic accent-glow">
                BATTLE TOGETHER.
              </span>
            </h1>
            <p className="text-xs sm:text-sm uppercase tracking-wider text-neutral-400 font-bold max-w-xl leading-relaxed">
              Create instant pixel rooms, test your drawing speed in 60-second battles, or solve real-time guessing puzzles with creators worldwide.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <button
                id="btn-quick-play"
                onClick={handleQuickPlay}
                className="px-6 py-3.5 bg-white text-black font-black uppercase text-xs sm:text-sm tracking-tighter hover:bg-neutral-200 transition-all flex items-center gap-2.5 shadow-lg active:translate-y-0.5"
              >
                <Play className="w-4 h-4 fill-black" />
                QUICK PLAY
              </button>

              <button
                id="btn-create-lobby-hero"
                onClick={() => {
                  soundEngine.playJoin();
                  onOpenCreateModal();
                }}
                className="px-6 py-3.5 bg-[#171717] hover:bg-[#222222] border border-[#333333] hover:border-white text-white font-black uppercase text-xs sm:text-sm tracking-tighter transition-all flex items-center gap-2.5 active:translate-y-0.5"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                CREATE LOBBY
              </button>

              <button
                id="btn-solo-studio"
                onClick={() => {
                  soundEngine.playJoin();
                  onOpenSoloStudio();
                }}
                className="px-5 py-3.5 bg-[#121212] hover:bg-[#1a1a1a] border border-[#262626] text-neutral-300 hover:text-white font-black uppercase text-xs tracking-wider transition-colors flex items-center gap-2"
              >
                <PaletteIcon className="w-4 h-4 text-emerald-400" />
                SOLO CANVAS
              </button>
            </div>
          </div>

          {/* Join with Code Card */}
          <div className="w-full lg:w-88 bg-[#0D0D0D] border border-[#2A2A2A] p-6 shrink-0">
            <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-black mb-1">
              FAST ACCESS
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              JOIN BY ROOM CODE
            </h3>
            <p className="text-xs text-neutral-400 uppercase tracking-wider mb-4 font-bold">
              ENTER 6-DIGIT ROOM KEY TO ENTER:
            </p>
            <form onSubmit={handleJoinByCode} className="space-y-3">
              <input
                type="text"
                maxLength={16}
                placeholder="E.G. PIX-742"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                className="w-full bg-[#181818] border border-[#333] focus:border-blue-500 px-4 py-3 text-sm font-mono-code uppercase text-white tracking-widest placeholder:text-neutral-600 focus:outline-none font-bold"
              />
              <button
                type="submit"
                disabled={!roomCodeInput.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2"
              >
                JOIN LOBBY NOW
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Lobby Browser Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#222]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-black mb-1">
              MULTIPLAYER SERVERS
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
              <span>ACTIVE PUBLIC LOBBIES</span>
              <span className="text-xs px-2.5 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-mono-code font-bold">
                {filteredLobbies.length} ONLINE
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="SEARCH LOBBIES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] border border-[#2A2A2A] focus:border-blue-500 pl-10 pr-4 py-2.5 text-xs font-bold uppercase text-white placeholder:text-neutral-600 focus:outline-none"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={fetchLobbies}
              disabled={loading}
              title="Refresh lobby list"
              className="p-2.5 bg-[#121212] hover:bg-[#1e1e1e] border border-[#2A2A2A] text-neutral-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mode Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'ALL MODES' },
            { id: 'collab', label: '🎨 FREE COLLAB' },
            { id: 'guess', label: '🎯 GUESS & DRAW' },
            { id: 'speed_battle', label: '⚡ SPEED BATTLE' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as 'all' | GameMode)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                selectedFilter === tab.id
                  ? 'bg-white text-black border-white'
                  : 'bg-[#121212] border-[#262626] text-neutral-400 hover:text-white hover:border-[#444]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lobbies Grid */}
        {filteredLobbies.length === 0 ? (
          <div className="bg-[#111111] border border-[#222222] p-12 text-center">
            <div className="w-14 h-14 bg-[#181818] border border-[#333] flex items-center justify-center mx-auto mb-4 text-2xl font-black">
              🎨
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-2">
              NO MATCHING LOBBIES ACTIVE
            </h3>
            <p className="text-xs uppercase tracking-wider text-neutral-400 mb-6 max-w-sm mx-auto font-bold">
              BE THE FIRST TO INITIATE A NEW MULTIPLAYER CANVAS SESSION.
            </p>
            <button
              onClick={onOpenCreateModal}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-wider transition-colors"
            >
              CREATE NEW LOBBY
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLobbies.map((lobby) => {
              const modeBadge = getModeBadge(lobby.gameMode);
              const isFull = lobby.playerCount >= lobby.maxPlayers;

              return (
                <div
                  key={lobby.id}
                  className="bg-[#111111] hover:bg-[#161616] border border-[#222222] hover:border-[#444444] p-5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Mode Badge & Grid size */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-2 py-0.5 text-[10px] tracking-wider uppercase flex items-center gap-1.5 ${modeBadge.color}`}>
                        <span>{modeBadge.icon}</span>
                        <span>{modeBadge.label}</span>
                      </span>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono-code font-bold bg-[#0A0A0A] px-2 py-0.5 border border-[#222]">
                        <Grid className="w-3 h-3 text-blue-400" />
                        <span>{lobby.gridSize}×{lobby.gridSize}</span>
                      </div>
                    </div>

                    {/* Room Name & Code */}
                    <h3 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-1.5">
                      {lobby.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono-code text-neutral-400 mb-4">
                      <span>KEY: <strong className="text-blue-400 font-bold">{lobby.id}</strong></span>
                      <span>•</span>
                      <span>HOST: <strong className="text-neutral-200">{lobby.hostName}</strong></span>
                    </div>
                  </div>

                  {/* Bottom Row: Player Count & Join Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#222222]">
                    <div className="flex items-center gap-2 text-xs font-mono-code">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className={`font-black ${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {lobby.playerCount}/{lobby.maxPlayers}
                      </span>
                      <span className="text-neutral-500 uppercase tracking-wider text-[10px] font-sans font-bold">SLOTS</span>
                    </div>

                    <button
                      onClick={() => {
                        soundEngine.playJoin();
                        onJoinLobby(lobby.id);
                      }}
                      disabled={isFull}
                      className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        isFull
                          ? 'bg-[#1a1a1a] text-neutral-600 cursor-not-allowed border border-[#252525]'
                          : 'bg-white hover:bg-neutral-200 text-black shadow-md'
                      }`}
                    >
                      <span>{isFull ? 'FULL' : 'JOIN ROOM'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
