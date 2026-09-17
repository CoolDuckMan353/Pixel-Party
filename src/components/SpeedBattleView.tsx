import React, { useState } from 'react';
import { Trophy, Heart, Check, Clock } from 'lucide-react';
import { SpeedBattleSubmission } from '../types/game';
import { exportCanvasToDataUrl } from '../utils/drawing';
import { soundEngine } from '../utils/audio';

interface SpeedBattleViewProps {
  submissions: Record<string, SpeedBattleSubmission>;
  currentPrompt: string | null;
  gridSize: number;
  currentUserId: string;
  timeRemaining: number;
  onVote: (targetPlayerId: string) => void;
}

export const SpeedBattleView: React.FC<SpeedBattleViewProps> = ({
  submissions,
  currentPrompt,
  gridSize,
  currentUserId,
  timeRemaining,
  onVote,
}) => {
  const [votedFor, setVotedFor] = useState<string | null>(null);

  const submissionList = (Object.values(submissions || {}) as SpeedBattleSubmission[]);

  const handleVote = (targetPlayerId: string) => {
    if (targetPlayerId === currentUserId) return; // Cannot vote for yourself
    setVotedFor(targetPlayerId);
    soundEngine.playCorrectGuess();
    onVote(targetPlayerId);
  };

  return (
    <div className="bg-[#111111] border border-[#222222] p-6 shadow-2xl">
      {/* Header */}
      <div className="text-center max-w-lg mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500 text-black text-xs font-black uppercase tracking-wider mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>VOTING ARENA</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
          VOTE FOR BEST &quot;{currentPrompt}&quot;
        </h2>
        <p className="text-xs text-neutral-400 font-mono-code font-bold uppercase tracking-wider mt-2">
          REVIEW SUBMISSIONS & CAST YOUR VOTE ({timeRemaining}S REMAINING)
        </p>
      </div>

      {/* Submissions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {submissionList.map((sub) => {
          const isOwn = sub.playerId === currentUserId;
          const isSelected = votedFor === sub.playerId || sub.votedBy?.includes(currentUserId);
          const dataUrl = exportCanvasToDataUrl(sub.canvas, gridSize, 8);

          return (
            <div
              key={sub.playerId}
              className={`bg-[#0D0D0D] border p-4 flex flex-col items-center justify-between transition-all ${
                isSelected
                  ? 'border-amber-400 ring-2 ring-amber-400 scale-[1.02] shadow-2xl'
                  : 'border-[#222222] hover:border-[#444]'
              }`}
            >
              {/* Artist Info */}
              <div className="flex items-center gap-2 mb-3 w-full justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{sub.avatar}</span>
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    {sub.playerName} {isOwn && '(YOU)'}
                  </span>
                </div>
                <div className="px-2 py-0.5 bg-amber-400 text-black text-xs font-mono-code font-black uppercase">
                  ❤️ {sub.votes || 0}
                </div>
              </div>

              {/* Artwork Preview */}
              <div className="w-48 h-48 bg-[#050505] border border-[#222222] overflow-hidden flex items-center justify-center p-2 mb-4">
                {dataUrl ? (
                  <img
                    src={dataUrl}
                    alt={`${sub.playerName}'s art`}
                    className="pixelated w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-neutral-600 font-mono-code font-bold uppercase">NO ART</span>
                )}
              </div>

              {/* Vote Button */}
              <button
                onClick={() => handleVote(sub.playerId)}
                disabled={isOwn || isSelected}
                className={`w-full py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isOwn
                    ? 'bg-[#181818] border border-[#262626] text-neutral-500 cursor-not-allowed'
                    : isSelected
                    ? 'bg-amber-400 text-black'
                    : 'bg-white text-black hover:bg-neutral-200'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    VOTED!
                  </>
                ) : isOwn ? (
                  'YOUR ART'
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    VOTE THIS ART
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
