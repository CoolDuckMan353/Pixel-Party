import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  Send, 
  Crown, 
  Pencil, 
  CheckCircle, 
  Sparkles, 
  Flame, 
  Trophy,
  Smile
} from 'lucide-react';
import { Player, ChatMessage, Lobby } from '../types/game';
import { soundEngine } from '../utils/audio';

interface ChatAndPlayersProps {
  lobby: Lobby;
  currentPlayer: Player;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendEmote: (emoji: string) => void;
}

const QUICK_EMOTES = ['🔥', '❤️', '😂', '👏', '🎨', '🚀', '👑', '👾', '💎', '🍕'];

export const ChatAndPlayers: React.FC<ChatAndPlayersProps> = ({
  lobby,
  currentPlayer,
  chatMessages,
  onSendMessage,
  onSendEmote,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'players'>('chat');
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const playersList = (Object.values(lobby.players || {}) as Player[]).sort((a, b) => b.score - a.score);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const isDrawer = lobby.currentDrawerId === currentPlayer.id;
  const isGuessMode = lobby.gameMode === 'guess';

  return (
    <div className="bg-[#111111] border border-[#222222] flex flex-col h-full min-h-[420px] max-h-[680px] shadow-xl overflow-hidden">
      {/* Tab Switcher Header */}
      <div className="flex items-center justify-between border-b border-[#222222] bg-[#0D0D0D] p-2">
        <div className="flex gap-1.5 w-full">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-1.5 px-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'chat'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-[#181818] border border-[#262626]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>CHAT & GUESSES</span>
          </button>

          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 py-1.5 px-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'players'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white bg-[#181818] border border-[#262626]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>PLAYERS ({playersList.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content: Chat */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Feed */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
            {chatMessages.length === 0 && (
              <div className="text-center text-neutral-500 py-6 text-[11px] font-mono-code font-bold uppercase tracking-wider">
                NO MESSAGES YET. {isGuessMode ? 'TYPE YOUR GUESS BELOW!' : 'SAY HELLO TO THE LOBBY!'}
              </div>
            )}

            {chatMessages.map((msg) => {
              if (msg.type === 'guess_correct') {
                return (
                  <div
                    key={msg.id}
                    className="p-2.5 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center gap-2 font-black uppercase tracking-wider text-xs animate-in fade-in"
                  >
                    <span>🎉</span>
                    <span>
                      <strong className="text-white">{msg.senderName}</strong> {msg.text}
                    </span>
                  </div>
                );
              }

              if (msg.type === 'system') {
                return (
                  <div
                    key={msg.id}
                    className="py-1 px-2 text-center text-[10px] text-neutral-400 font-mono-code font-bold uppercase tracking-wider"
                  >
                    {msg.text}
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex flex-col gap-0.5 bg-[#141414] p-1.5 border border-[#222]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-black uppercase tracking-wider text-[11px]"
                      style={{ color: msg.senderColor || '#60a5fa' }}
                    >
                      {msg.senderName}:
                    </span>
                    <span className="text-neutral-200 break-words font-medium">{msg.text}</span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Floating Emote Bar */}
          <div className="px-3 py-1.5 bg-[#0D0D0D] border-t border-[#222222] flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
            <span className="text-[10px] text-neutral-500 font-mono-code font-bold uppercase tracking-wider">REACT:</span>
            {QUICK_EMOTES.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  soundEngine.playJoin();
                  onSendEmote(emoji);
                }}
                className="hover:scale-125 transition-transform text-sm p-1"
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Chat / Guess Input Box */}
          <form onSubmit={handleSend} className="p-2 bg-[#0A0A0A] border-t border-[#222222] flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isDrawer && isGuessMode && lobby.status === 'drawing'}
              placeholder={
                isDrawer && isGuessMode && lobby.status === 'drawing'
                  ? "YOU ARE DRAWING (CAN'T GUESS)"
                  : isGuessMode && lobby.status === 'drawing'
                  ? 'TYPE YOUR GUESS HERE...'
                  : 'SEND MESSAGE...'
              }
              className="flex-1 bg-[#161616] border border-[#333] focus:border-white px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none disabled:opacity-40 uppercase tracking-wider font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || (isDrawer && isGuessMode && lobby.status === 'drawing')}
              className="px-4 bg-white text-black hover:bg-neutral-200 disabled:opacity-30 font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Tab Content: Players */}
      {activeTab === 'players' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {playersList.map((p) => {
            const isMe = p.id === currentPlayer.id;
            const isCurrentDrawer = p.id === lobby.currentDrawerId;

            return (
              <div
                key={p.id}
                className={`p-3 border flex items-center justify-between gap-2 transition-colors ${
                  isMe
                    ? 'bg-[#181818] border-white'
                    : 'bg-[#121212] border-[#262626]'
                }`}
              >
                {/* Left: Avatar & Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative">
                    <span className="text-xl">{p.avatar}</span>
                    {p.isHost && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 absolute -top-1.5 -right-1.5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black uppercase tracking-wider text-white truncate">
                        {p.name}
                      </span>
                      {isMe && (
                        <span className="text-[9px] bg-white text-black px-1 font-black uppercase">
                          YOU
                        </span>
                      )}
                    </div>
                    {isCurrentDrawer && (
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Pencil className="w-2.5 h-2.5" /> DRAWING
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Score & Status */}
                <div className="flex items-center gap-2">
                  {lobby.gameMode !== 'collab' && (
                    <div className="text-right">
                      <span className="text-sm font-mono-code font-black text-amber-400">
                        {p.score}
                      </span>
                      <span className="text-[9px] text-neutral-500 font-mono-code font-bold block uppercase">PTS</span>
                    </div>
                  )}

                  {lobby.status === 'waiting' && (
                    <span
                      className={`text-[10px] px-2 py-0.5 font-mono-code font-black uppercase ${
                        p.isReady ? 'bg-emerald-600 text-white' : 'bg-[#222] text-neutral-400'
                      }`}
                    >
                      {p.isReady ? 'READY' : 'WAIT'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
