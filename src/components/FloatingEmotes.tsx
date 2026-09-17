import React, { useEffect, useState } from 'react';
import { FloatingEmote } from '../types/game';

interface FloatingEmotesProps {
  emotes: FloatingEmote[];
}

export const FloatingEmotes: React.FC<FloatingEmotesProps> = ({ emotes }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {emotes.map((item) => (
        <div
          key={item.id}
          className="absolute animate-float-fade flex flex-col items-center select-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
          }}
        >
          <span className="text-3xl filter drop-shadow-md">{item.emoji}</span>
          <span className="text-[10px] font-mono-code font-black uppercase text-white bg-black/80 border border-[#333] px-2 py-0.5 mt-0.5 tracking-wider">
            {item.senderName}
          </span>
        </div>
      ))}
    </div>
  );
};
