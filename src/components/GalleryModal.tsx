import React from 'react';
import { X, FolderHeart, Download, Trash2, Palette, Clock, User } from 'lucide-react';
import { SavedPixelArt } from '../types/game';
import { exportCanvasToDataUrl } from '../utils/drawing';
import { soundEngine } from '../utils/audio';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedArtworks: SavedPixelArt[];
  onDeleteArt: (id: string) => void;
  onLoadArt?: (art: SavedPixelArt) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  savedArtworks,
  onDeleteArt,
  onLoadArt,
}) => {
  if (!isOpen) return null;

  const handleDownload = (art: SavedPixelArt) => {
    soundEngine.playRoundStart();
    const url = exportCanvasToDataUrl(art.pixels, art.gridSize, 16);
    const link = document.createElement('a');
    link.download = `${art.title.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#111111] border border-[#333333] p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#222222]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-pink-600 text-white">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                ARTWORK GALLERY
              </h2>
              <p className="text-xs text-neutral-400 font-mono-code font-bold uppercase tracking-wider">
                SAVED PIXEL MASTERPIECES ({savedArtworks.length})
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

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {savedArtworks.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <Palette className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-black text-neutral-400 uppercase tracking-wider">
                NO ARTWORKS SAVED YET
              </p>
              <p className="text-xs text-neutral-500 font-mono-code mt-1 uppercase">
                Create something in a lobby or studio, then click Export to save!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedArtworks.map((art) => {
                const previewUrl = exportCanvasToDataUrl(art.pixels, art.gridSize, 6);

                return (
                  <div
                    key={art.id}
                    className="bg-[#0D0D0D] border border-[#222222] hover:border-[#444] p-3.5 flex flex-col justify-between transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className="w-full aspect-square bg-[#050505] border border-[#1A1A1A] overflow-hidden p-2 flex items-center justify-center mb-3">
                      <img
                        src={previewUrl}
                        alt={art.title}
                        className="pixelated w-full h-full object-contain"
                      />
                    </div>

                    {/* Metadata */}
                    <div>
                      <h4 className="text-xs font-black text-white truncate uppercase tracking-wider mb-1">
                        {art.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono-code font-bold uppercase mb-3">
                        <span>{art.gridSize}×{art.gridSize}</span>
                        <span>{new Date(art.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-[#222222]">
                      <button
                        onClick={() => handleDownload(art)}
                        title="Download PNG"
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PNG
                      </button>

                      {onLoadArt && (
                        <button
                          onClick={() => {
                            soundEngine.playJoin();
                            onLoadArt(art);
                            onClose();
                          }}
                          title="Load into Canvas"
                          className="px-2.5 py-1.5 bg-[#1C1C1C] hover:bg-[#2A2A2A] text-neutral-200 text-xs font-black uppercase tracking-wider transition-colors"
                        >
                          LOAD
                        </button>
                      )}

                      <button
                        onClick={() => {
                          soundEngine.playUndo();
                          onDeleteArt(art.id);
                        }}
                        title="Delete Artwork"
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
