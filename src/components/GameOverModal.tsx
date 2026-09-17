import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Medal, Award, RotateCcw, Home, Sparkles } from 'lucide-react';
import { Player } from '../types/game';
import { soundEngine } from '../utils/audio';

interface GameOverModalProps {
  isOpen: boolean;
  scores: { id: string; name: string; score: number; avatar: string; color: string }[];
  isHost: boolean;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  scores,
  isHost,
  onPlayAgain,
  onReturnToLobby,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEngine.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sortedScores = [...scores].sort((a, b) => b.score - a.score);
  const winner = sortedScores[0];
  const second = sortedScores[1];
  const third = sortedScores[2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#111111] border border-amber-400 p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-16 w-64 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-black text-xs font-black uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GAME OVER</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-6">
          VICTORY PODIUM
        </h2>

        {/* 3-Place Podium */}
        <div className="flex items-end justify-center gap-3 mb-8 h-48">
          {/* 2nd Place */}
          {second && (
            <div className="flex flex-col items-center flex-1 max-w-[100px]">
              <span className="text-2xl mb-1">{second.avatar}</span>
              <span className="text-xs font-black uppercase tracking-wider text-neutral-300 truncate w-full">
                {second.name}
              </span>
              <span className="text-[10px] text-amber-400 font-mono-code font-bold mb-2">
                {second.score} PTS
              </span>
              <div className="w-full h-24 bg-[#1E1E1E] border-t-2 border-neutral-400 flex items-center justify-center">
                <Medal className="w-6 h-6 text-neutral-300" />
              </div>
            </div>
          )}

          {/* 1st Place Champion */}
          {winner && (
            <div className="flex flex-col items-center flex-1 max-w-[120px]">
              <div className="relative">
                <span className="text-4xl mb-1 block animate-bounce">{winner.avatar}</span>
                <Trophy className="w-5 h-5 text-amber-400 fill-amber-400 absolute -top-3 -right-2" />
              </div>
              <span className="text-sm font-black uppercase tracking-wider text-white truncate w-full">
                {winner.name}
              </span>
              <span className="text-xs text-amber-300 font-mono-code font-black mb-2">
                {winner.score} PTS
              </span>
              <div className="w-full h-32 bg-amber-500 border-t-2 border-white flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-black fill-black" />
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div className="flex flex-col items-center flex-1 max-w-[100px]">
              <span className="text-2xl mb-1">{third.avatar}</span>
              <span className="text-xs font-black uppercase tracking-wider text-neutral-300 truncate w-full">
                {third.name}
              </span>
              <span className="text-[10px] text-amber-400 font-mono-code font-bold mb-2">
                {third.score} PTS
              </span>
              <div className="w-full h-18 bg-[#181818] border-t-2 border-amber-800 flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onReturnToLobby}
            className="px-5 py-2.5 bg-[#181818] hover:bg-[#222] border border-[#333] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            LOBBY MENU
          </button>

          {isHost && (
            <button
              onClick={onPlayAgain}
              className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-black uppercase text-xs tracking-wider flex items-center gap-2 shadow-lg transition-transform active:translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" />
              PLAY AGAIN
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
