import React from 'react';
import { 
  Clock, 
  Play, 
  CheckCircle2, 
  Circle, 
  Crown, 
  Sparkles, 
  Eye, 
  Trophy, 
  Timer,
  Lightbulb
} from 'lucide-react';
import { Lobby, Player } from '../types/game';
import { soundEngine } from '../utils/audio';

interface GameHeaderProps {
  lobby: Lobby;
  currentPlayer: Player;
  onStartGame: () => void;
  onToggleReady: () => void;
  onChooseWord?: (word: string) => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  lobby,
  currentPlayer,
  onStartGame,
  onToggleReady,
  onChooseWord,
}) => {
  const isHost = lobby.hostId === currentPlayer.id;
  const isDrawer = lobby.currentDrawerId === currentPlayer.id;
  const currentDrawer = lobby.currentDrawerId ? lobby.players[lobby.currentDrawerId] : null;

  // Mask the secret word for guessers (e.g. "_ _ _ _ _")
  const getMaskedPrompt = () => {
    if (!lobby.currentPrompt) return '';
    if (isDrawer || lobby.status === 'round_end' || lobby.status === 'game_over') {
      return lobby.currentPrompt;
    }
    // Show masked dashes with spaces
    return lobby.currentPrompt
      .split('')
      .map((char) => (char === ' ' ? '  ' : '_'))
      .join(' ');
  };

  const getTimerPercentage = () => {
    if (!lobby.roundTime || lobby.roundTime <= 0) return 100;
    return (lobby.timeRemaining / lobby.roundTime) * 100;
  };

  const isLowTime = lobby.timeRemaining <= 10 && lobby.timeRemaining > 0;

  return (
    <div className="bg-[#111111] border border-[#222222] p-3 sm:p-4 shadow-xl flex flex-col gap-3">
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mode Title & Round Indicator */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-blue-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            {lobby.gameMode === 'guess' && <span>🎯 GUESS & DRAW</span>}
            {lobby.gameMode === 'speed_battle' && <span>⚡ SPEED BATTLE</span>}
            {lobby.gameMode === 'collab' && <span>🎨 FREE COLLAB</span>}
            {lobby.gameMode === 'relay' && <span>🔄 RELAY ART</span>}
          </div>

          {lobby.gameMode !== 'collab' && lobby.status !== 'waiting' && (
            <span className="text-xs text-neutral-400 font-mono-code font-bold uppercase tracking-wider">
              ROUND <strong className="text-white font-black">{lobby.currentRound}</strong>/{lobby.totalRounds}
            </span>
          )}
        </div>

        {/* Center: Secret Word / Hint Banner (Guess Mode) */}
        {lobby.gameMode === 'guess' && lobby.status === 'drawing' && (
          <div className="flex items-center gap-2.5 bg-[#0D0D0D] px-4 py-2 border border-[#333]">
            {isDrawer ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400 font-black uppercase tracking-wider">DRAWING:</span>
                <span className="text-lg font-black uppercase tracking-wider text-white accent-glow">
                  {lobby.currentPrompt}
                </span>
                {lobby.promptCategory && (
                  <span className="text-[10px] bg-[#222] text-neutral-300 px-2 py-0.5 font-bold uppercase font-mono-code">
                    {lobby.promptCategory}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs text-neutral-400 font-black uppercase tracking-wider">WORD:</span>
                <span className="text-lg font-mono-code font-black tracking-[0.25em] text-white">
                  {getMaskedPrompt()}
                </span>
                <span className="text-[11px] text-neutral-500 font-mono-code font-bold">
                  [{lobby.currentPrompt?.length} LETTERS]
                </span>
              </div>
            )}
          </div>
        )}

        {/* Center: Theme Banner (Speed Battle Mode) */}
        {lobby.gameMode === 'speed_battle' && lobby.status === 'drawing' && (
          <div className="flex items-center gap-2.5 bg-[#0D0D0D] px-4 py-2 border border-amber-600/50">
            <span className="text-xs text-amber-400 font-black uppercase tracking-wider">PROMPT:</span>
            <span className="text-lg font-black uppercase tracking-tight text-white accent-glow">
              {lobby.currentPrompt}
            </span>
            <span className="text-[10px] bg-amber-950/60 text-amber-300 px-2 py-0.5 font-mono-code font-bold uppercase border border-amber-800">
              SPRITE BATTLE
            </span>
          </div>
        )}

        {/* Right: Round Timer / Controls */}
        <div className="flex items-center gap-3">
          {/* Active Timer Pill */}
          {['drawing', 'choosing_word', 'voting'].includes(lobby.status) && (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 font-mono-code text-xs font-black uppercase border transition-colors ${
                isLowTime
                  ? 'bg-red-950/80 border-red-500 text-red-400 animate-bounce'
                  : 'bg-[#0D0D0D] border-[#333] text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{lobby.timeRemaining}S</span>
            </div>
          )}

          {/* Lobby Waiting State Action: Start Game or Ready */}
          {lobby.status === 'waiting' && (
            <div className="flex items-center gap-2">
              {isHost ? (
                <button
                  id="btn-host-start-game"
                  onClick={onStartGame}
                  className="px-5 py-2 bg-white hover:bg-neutral-200 text-black font-black uppercase text-xs tracking-wider shadow-lg flex items-center gap-2 transition-all active:translate-y-0.5"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  START GAME
                </button>
              ) : (
                <button
                  onClick={onToggleReady}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all ${
                    currentPlayer.isReady
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-[#181818] border-[#333] text-neutral-300 hover:text-white hover:border-white'
                  }`}
                >
                  {currentPlayer.isReady ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      READY
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5 text-neutral-400" />
                      CLICK READY
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Word Selection Overlay for the Drawer */}
      {lobby.gameMode === 'guess' && lobby.status === 'choosing_word' && isDrawer && (
        <div className="p-4 bg-[#141414] border border-blue-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white">CHOOSE WORD TO DRAW:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lobby.promptOptions?.map((word) => (
              <button
                key={word}
                onClick={() => {
                  soundEngine.playRoundStart();
                  onChooseWord?.(word);
                }}
                className="px-5 py-2 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-neutral-200 shadow-md transition-all active:scale-95"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Drawer Announcement for guessers */}
      {lobby.gameMode === 'guess' && lobby.status === 'choosing_word' && !isDrawer && currentDrawer && (
        <div className="p-3 bg-[#0D0D0D] border border-[#333] text-center text-xs text-neutral-300 font-mono-code font-bold uppercase tracking-wider">
          ⏳ <strong className="text-blue-400">{currentDrawer.name}</strong> IS SELECTING A WORD ({lobby.timeRemaining}S)...
        </div>
      )}

      {/* Time Progress Bar */}
      {['drawing', 'choosing_word', 'voting'].includes(lobby.status) && (
        <div className="w-full bg-[#0D0D0D] h-1.5 overflow-hidden border border-[#222]">
          <div
            className={`h-full transition-all duration-1000 ${
              isLowTime
                ? 'bg-rose-500'
                : lobby.gameMode === 'speed_battle'
                ? 'bg-amber-400'
                : 'bg-blue-500'
            }`}
            style={{ width: `${getTimerPercentage()}%` }}
          />
        </div>
      )}
    </div>
  );
};
