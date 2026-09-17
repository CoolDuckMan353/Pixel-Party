import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Lobby, 
  Player, 
  ToolType, 
  PixelChange, 
  RemoteCursor, 
  FloatingEmote, 
  ChatMessage, 
  SavedPixelArt, 
  GameMode 
} from './types/game';
import { createEmptyCanvas, exportCanvasToDataUrl } from './utils/drawing';
import { PALETTES, getPaletteById } from './utils/palettes';
import { soundEngine } from './utils/audio';
import { Navbar } from './components/Navbar';
import { LobbyBrowser } from './components/LobbyBrowser';
import { CreateLobbyModal } from './components/CreateLobbyModal';
import { PixelCanvas } from './components/PixelCanvas';
import { DrawingToolbar } from './components/DrawingToolbar';
import { PaletteSelector } from './components/PaletteSelector';
import { GameHeader } from './components/GameHeader';
import { ChatAndPlayers } from './components/ChatAndPlayers';
import { SpeedBattleView } from './components/SpeedBattleView';
import { GameOverModal } from './components/GameOverModal';
import { ExportModal } from './components/ExportModal';
import { GalleryModal } from './components/GalleryModal';
import { HelpModal } from './components/HelpModal';
import { FloatingEmotes } from './components/FloatingEmotes';

const LOCAL_STORAGE_PLAYER = 'pixel_party_user_profile';
const LOCAL_STORAGE_GALLERY = 'pixel_party_saved_gallery';

function getStoredPlayer(): Player {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_PLAYER);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(e);
  }
  const id = 'user-' + Math.random().toString(36).substring(2, 9);
  const randomNum = Math.floor(100 + Math.random() * 900);
  const emojis = ['🎨', '👾', '🦊', '🐱', '🐸', '🚀', '⭐', '🦄', '🤖', '👑'];
  const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
  const defaultPlayer: Player = {
    id,
    name: `Artist #${randomNum}`,
    avatar: emojis[Math.floor(Math.random() * emojis.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    score: 0,
    isHost: false,
    isReady: false,
    hasGuessed: false,
    isDrawer: false,
    lastActive: Date.now(),
  };
  localStorage.setItem(LOCAL_STORAGE_PLAYER, JSON.stringify(defaultPlayer));
  return defaultPlayer;
}

function getStoredGallery(): SavedPixelArt[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_GALLERY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export default function App() {
  const [player, setPlayer] = useState<Player>(getStoredPlayer);
  const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
  const [isSoloStudio, setIsSoloStudio] = useState<boolean>(false);

  // Canvas & Drawing Tools State
  const [gridSize, setGridSize] = useState<number>(32);
  const [canvasPixels, setCanvasPixels] = useState<string[]>(() => createEmptyCanvas(32));
  const [activeTool, setActiveTool] = useState<ToolType>('pencil');
  const [brushSize, setBrushSize] = useState<number>(1);
  const [primaryColor, setPrimaryColor] = useState<string>('#FF004D');
  const [secondaryColor, setSecondaryColor] = useState<string>('#000000');
  const [recentColors, setRecentColors] = useState<string[]>([
    '#FF004D', '#FFA300', '#FFEC27', '#00E436', '#29ADFF', '#83769C', '#000000', '#FFFFFF'
  ]);
  const [currentPaletteId, setCurrentPaletteId] = useState<string>('pico-8');
  const [gridType, setGridType] = useState<'none' | 'subtle' | 'dots' | 'clear'>('subtle');
  const [symmetryMode, setSymmetryMode] = useState<'none' | 'horizontal' | 'vertical' | 'quad'>('none');
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Undo & Redo History
  const [undoStack, setUndoStack] = useState<string[][]>([]);
  const [redoStack, setRedoStack] = useState<string[][]>([]);

  // Multiplayer Live Collaboration State
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [floatingEmotes, setFloatingEmotes] = useState<FloatingEmote[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [savedArtworks, setSavedArtworks] = useState<SavedPixelArt[]>(getStoredGallery);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [gameOverScores, setGameOverScores] = useState<{ id: string; name: string; score: number; avatar: string; color: string }[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  // Update Player profile in state & localStorage
  const handleUpdatePlayer = (updated: Partial<Player>) => {
    setPlayer((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem(LOCAL_STORAGE_PLAYER, JSON.stringify(next));
      return next;
    });
  };

  // Connect or switch WebSocket room
  const connectToLobbyWS = useCallback((lobbyId: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          event: 'join_lobby',
          payload: {
            lobbyId,
            player,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { event: evt, payload } = msg;

        switch (evt) {
          case 'lobby_state': {
            const lobby: Lobby = payload.lobby;
            setCurrentLobby(lobby);
            setGridSize(lobby.gridSize);
            setCanvasPixels(lobby.canvas || createEmptyCanvas(lobby.gridSize));
            if (lobby.paletteId) setCurrentPaletteId(lobby.paletteId);
            break;
          }

          case 'player_joined': {
            const { player: joinedP, players } = payload;
            setCurrentLobby((prev) => (prev ? { ...prev, players } : null));
            soundEngine.playJoin();
            setChatMessages((prev) => [
              ...prev,
              {
                id: 'sys-' + Date.now(),
                senderId: 'system',
                senderName: 'System',
                senderColor: '#94a3b8',
                text: `${joinedP.name} joined the room!`,
                type: 'system',
                timestamp: Date.now(),
              },
            ]);
            break;
          }

          case 'player_left': {
            const { playerName, players, newHostId } = payload;
            setCurrentLobby((prev) =>
              prev ? { ...prev, players, hostId: newHostId || prev.hostId } : null
            );
            setChatMessages((prev) => [
              ...prev,
              {
                id: 'sys-' + Date.now(),
                senderId: 'system',
                senderName: 'System',
                senderColor: '#94a3b8',
                text: `${playerName} left the room.`,
                type: 'system',
                timestamp: Date.now(),
              },
            ]);
            break;
          }

          case 'player_updated': {
            const { players } = payload;
            setCurrentLobby((prev) => (prev ? { ...prev, players } : null));
            break;
          }

          case 'turn_start': {
            const { drawerId, drawerName, promptOptions, currentRound, totalRounds } = payload;
            soundEngine.playRoundStart();
            setCurrentLobby((prev) => {
              if (!prev) return null;
              const cleared = createEmptyCanvas(prev.gridSize);
              return {
                ...prev,
                currentDrawerId: drawerId,
                status: 'choosing_word',
                promptOptions,
                currentRound,
                totalRounds,
                canvas: cleared,
              };
            });
            setCanvasPixels((prev) => createEmptyCanvas(prev.length === 32 * 32 ? 32 : Math.sqrt(prev.length)));
            setUndoStack([]);
            setRedoStack([]);
            break;
          }

          case 'word_chosen': {
            const { drawerId, timeRemaining, category } = payload;
            soundEngine.playRoundStart();
            setCurrentLobby((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                status: 'drawing',
                timeRemaining,
                promptCategory: category,
              };
            });
            break;
          }

          case 'timer_tick': {
            const { timeRemaining, status } = payload;
            if (timeRemaining <= 5 && timeRemaining > 0) {
              soundEngine.playTimerTick();
            }
            setCurrentLobby((prev) => (prev ? { ...prev, timeRemaining, status } : null));
            break;
          }

          case 'stroke_applied': {
            const { changes } = payload;
            setCanvasPixels((prev) => {
              const copy = [...prev];
              for (const ch of changes) {
                if (ch.index >= 0 && ch.index < copy.length) {
                  copy[ch.index] = ch.color;
                }
              }
              return copy;
            });
            break;
          }

          case 'canvas_cleared': {
            setCanvasPixels((prev) => createEmptyCanvas(Math.sqrt(prev.length)));
            break;
          }

          case 'cursor_updated': {
            const { cursor } = payload;
            setRemoteCursors((prev) => {
              const filtered = prev.filter((c) => c.playerId !== cursor.playerId);
              return [...filtered, { ...cursor, updatedAt: Date.now() }];
            });
            break;
          }

          case 'chat_received': {
            const { message } = payload;
            if (message.type === 'guess_correct') {
              soundEngine.playCorrectGuess();
            }
            setChatMessages((prev) => [...prev, message]);
            break;
          }

          case 'close_guess_alert': {
            soundEngine.playCloseGuess();
            setChatMessages((prev) => [
              ...prev,
              {
                id: 'alert-' + Date.now(),
                senderId: 'system',
                senderName: 'Hint',
                senderColor: '#f59e0b',
                text: payload.text,
                type: 'system',
                timestamp: Date.now(),
              },
            ]);
            break;
          }

          case 'player_guessed': {
            const { scores } = payload;
            setCurrentLobby((prev) => {
              if (!prev) return null;
              const nextPlayers = { ...prev.players };
              scores.forEach((s: { id: string; score: number }) => {
                if (nextPlayers[s.id]) nextPlayers[s.id].score = s.score;
              });
              return { ...prev, players: nextPlayers };
            });
            break;
          }

          case 'emote_received': {
            const { id, emoji, x, y, senderName } = payload;
            setFloatingEmotes((prev) => [...prev, { id, emoji, x, y, senderName }]);
            setTimeout(() => {
              setFloatingEmotes((prev) => prev.filter((e) => e.id !== id));
            }, 2500);
            break;
          }

          case 'speed_battle_start': {
            const { prompt, category, timeRemaining, currentRound, totalRounds } = payload;
            soundEngine.playRoundStart();
            setCurrentLobby((prev) =>
              prev
                ? {
                    ...prev,
                    currentPrompt: prompt,
                    promptCategory: category,
                    status: 'drawing',
                    timeRemaining,
                    currentRound,
                    totalRounds,
                    canvas: createEmptyCanvas(prev.gridSize),
                  }
                : null
            );
            setCanvasPixels((prev) => createEmptyCanvas(Math.sqrt(prev.length)));
            setUndoStack([]);
            setRedoStack([]);
            break;
          }

          case 'voting_start': {
            const { submissions, timeRemaining } = payload;
            soundEngine.playRoundStart();
            setCurrentLobby((prev) =>
              prev
                ? {
                    ...prev,
                    status: 'voting',
                    speedBattleSubmissions: submissions,
                    timeRemaining,
                  }
                : null
            );
            break;
          }

          case 'vote_recorded': {
            const { targetPlayerId, votes, scores } = payload;
            setCurrentLobby((prev) => {
              if (!prev || !prev.speedBattleSubmissions) return prev;
              const nextSubs = { ...prev.speedBattleSubmissions };
              if (nextSubs[targetPlayerId]) {
                nextSubs[targetPlayerId].votes = votes;
              }
              const nextPlayers = { ...prev.players };
              scores.forEach((s: { id: string; score: number }) => {
                if (nextPlayers[s.id]) nextPlayers[s.id].score = s.score;
              });
              return { ...prev, speedBattleSubmissions: nextSubs, players: nextPlayers };
            });
            break;
          }

          case 'game_over': {
            const { scores } = payload;
            setGameOverScores(scores);
            setShowGameOverModal(true);
            setCurrentLobby((prev) => (prev ? { ...prev, status: 'game_over' } : null));
            break;
          }

          case 'round_timeout': {
            const { revealedWord } = payload;
            setChatMessages((prev) => [
              ...prev,
              {
                id: 'sys-end-' + Date.now(),
                senderId: 'system',
                senderName: 'System',
                senderColor: '#ef4444',
                text: `⏰ Time is up! The secret word was "${revealedWord}".`,
                type: 'system',
                timestamp: Date.now(),
              },
            ]);
            break;
          }
        }
      } catch (err) {
        console.error('WS message error:', err);
      }
    };

    ws.onclose = () => {
      // Reconnection or cleanup
    };
  }, [player]);

  // Clean stale remote cursors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRemoteCursors((prev) => prev.filter((c) => now - c.updatedAt < 3000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Join a lobby by ID
  const handleJoinLobby = (lobbyId: string) => {
    setIsSoloStudio(false);
    connectToLobbyWS(lobbyId);
  };

  // Leave current lobby
  const handleLeaveLobby = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setCurrentLobby(null);
    setIsSoloStudio(false);
    setChatMessages([]);
    setRemoteCursors([]);
    soundEngine.playUndo();
  };

  // Create Lobby
  const handleCreateLobby = async (config: {
    name: string;
    gameMode: GameMode;
    gridSize: number;
    maxPlayers: number;
    isPrivate: boolean;
    paletteId: string;
    roundTime: number;
    totalRounds: number;
  }) => {
    try {
      const res = await fetch('/api/lobbies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const created = await res.json();
        setShowCreateModal(false);
        handleJoinLobby(created.id);
      }
    } catch (e) {
      console.error('Failed to create lobby:', e);
    }
  };

  // Open Solo Studio
  const handleOpenSoloStudio = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setCurrentLobby(null);
    setIsSoloStudio(true);
    setGridSize(32);
    setCanvasPixels(createEmptyCanvas(32));
    setUndoStack([]);
    setRedoStack([]);
    soundEngine.playRoundStart();
  };

  // Drawing Stroke handler
  const handleDrawStroke = (changes: PixelChange[]) => {
    // Push previous state to undo stack
    setUndoStack((prev) => [...prev.slice(-25), [...canvasPixels]]);
    setRedoStack([]);

    // Update local canvas
    setCanvasPixels((prev) => {
      const next = [...prev];
      for (const ch of changes) {
        if (ch.index >= 0 && ch.index < next.length) {
          next[ch.index] = ch.color;
        }
      }
      return next;
    });

    // Track recent colors
    changes.forEach((ch) => {
      if (ch.color && ch.color !== 'transparent' && !recentColors.includes(ch.color)) {
        setRecentColors((prev) => [ch.color, ...prev.slice(0, 7)]);
      }
    });

    // If in multiplayer lobby, broadcast stroke to server
    if (currentLobby && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'draw_stroke',
          payload: {
            lobbyId: currentLobby.id,
            playerId: player.id,
            changes,
          },
        })
      );

      // If in Speed Battle mode, submit canvas state to speed_battle_submit
      if (currentLobby.gameMode === 'speed_battle' && currentLobby.status === 'drawing') {
        const updatedCanvas = [...canvasPixels];
        changes.forEach((ch) => {
          if (ch.index >= 0 && ch.index < updatedCanvas.length) {
            updatedCanvas[ch.index] = ch.color;
          }
        });
        wsRef.current.send(
          JSON.stringify({
            event: 'speed_battle_submit',
            payload: {
              lobbyId: currentLobby.id,
              playerId: player.id,
              canvas: updatedCanvas,
            },
          })
        );
      }
    }
  };

  // Broadcast cursor movement
  const handleCursorMove = (x: number, y: number) => {
    if (currentLobby && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'cursor_move',
          payload: {
            lobbyId: currentLobby.id,
            cursor: {
              x,
              y,
              playerId: player.id,
              playerName: player.name,
              color: player.color,
              tool: activeTool,
            },
          },
        })
      );
    }
  };

  // Chat message send
  const handleSendMessage = (text: string) => {
    if (currentLobby && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'send_chat',
          payload: {
            lobbyId: currentLobby.id,
            playerId: player.id,
            text,
          },
        })
      );
    }
  };

  // Emote reaction send
  const handleSendEmote = (emoji: string) => {
    const randX = Math.floor(20 + Math.random() * 60);
    const randY = Math.floor(30 + Math.random() * 40);

    if (currentLobby && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'send_emote',
          payload: {
            lobbyId: currentLobby.id,
            emoji,
            x: randX,
            y: randY,
            senderName: player.name,
          },
        })
      );
    } else {
      // Solo emote
      const id = 'solo-emote-' + Date.now();
      setFloatingEmotes((prev) => [...prev, { id, emoji, x: randX, y: randY, senderName: player.name }]);
      setTimeout(() => setFloatingEmotes((prev) => prev.filter((e) => e.id !== id)), 2500);
    }
  };

  // Undo / Redo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, [...canvasPixels]]);
    setCanvasPixels(previous);
    setUndoStack((prev) => prev.slice(0, -1));

    if (currentLobby && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Sync undo state
      const changes: PixelChange[] = previous.map((col, idx) => ({ index: idx, color: col }));
      wsRef.current.send(
        JSON.stringify({
          event: 'draw_stroke',
          payload: {
            lobbyId: currentLobby.id,
            playerId: player.id,
            changes,
          },
        })
      );
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, [...canvasPixels]]);
    setCanvasPixels(next);
    setRedoStack((prev) => prev.slice(0, -1));

    if (currentLobby && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const changes: PixelChange[] = next.map((col, idx) => ({ index: idx, color: col }));
      wsRef.current.send(
        JSON.stringify({
          event: 'draw_stroke',
          payload: {
            lobbyId: currentLobby.id,
            playerId: player.id,
            changes,
          },
        })
      );
    }
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    setUndoStack((prev) => [...prev, [...canvasPixels]]);
    setRedoStack([]);
    const empty = createEmptyCanvas(gridSize);
    setCanvasPixels(empty);

    if (currentLobby && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'clear_canvas',
          payload: {
            lobbyId: currentLobby.id,
            playerId: player.id,
          },
        })
      );
    }
  };

  // Start game / ready
  const handleStartGame = () => {
    if (currentLobby && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      soundEngine.playRoundStart();
      wsRef.current.send(
        JSON.stringify({
          event: 'start_game',
          payload: {
            lobbyId: currentLobby.id,
            playerId: player.id,
          },
        })
      );
    }
  };

  const handleToggleReady = () => {
    if (currentLobby && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      soundEngine.playJoin();
      wsRef.current.send(
        JSON.stringify({
          event: 'ready_toggle',
          payload: {
            lobbyId: currentLobby.id,
            playerId: player.id,
            isReady: !player.isReady,
          },
        })
      );
      setPlayer((prev) => ({ ...prev, isReady: !prev.isReady }));
    }
  };

  const handleChooseWord = (word: string) => {
    if (currentLobby && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'choose_word',
          payload: {
            lobbyId: currentLobby.id,
            playerId: player.id,
            word,
          },
        })
      );
    }
  };

  const handleSpeedBattleVote = (targetPlayerId: string) => {
    if (currentLobby && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'speed_battle_vote',
          payload: {
            lobbyId: currentLobby.id,
            voterId: player.id,
            targetPlayerId,
          },
        })
      );
    }
  };

  // Gallery Save / Delete
  const handleSaveToGallery = (art: SavedPixelArt) => {
    setSavedArtworks((prev) => {
      const updated = [art, ...prev];
      localStorage.setItem(LOCAL_STORAGE_GALLERY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteArt = (id: string) => {
    setSavedArtworks((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      localStorage.setItem(LOCAL_STORAGE_GALLERY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleLoadArt = (art: SavedPixelArt) => {
    setGridSize(art.gridSize);
    setCanvasPixels([...art.pixels]);
    setUndoStack([]);
    setRedoStack([]);
    if (currentLobby && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const changes: PixelChange[] = art.pixels.map((color, index) => ({ index, color }));
      handleDrawStroke(changes);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      const key = e.key.toLowerCase();
      switch (key) {
        case 'p': setActiveTool('pencil'); break;
        case 'e': setActiveTool('eraser'); break;
        case 'b': setActiveTool('bucket'); break;
        case 'i': setActiveTool('eyedropper'); break;
        case 'l': setActiveTool('line'); break;
        case 'r': setActiveTool(e.shiftKey ? 'rect_filled' : 'rect'); break;
        case 'c': setActiveTool(e.shiftKey ? 'circle_filled' : 'circle'); break;
        case 'd': setActiveTool('dither'); break;
        case 'u': setActiveTool('shade_light'); break;
        case 'j': setActiveTool('shade_dark'); break;
        case 'x': {
          // Swap primary & secondary
          const temp = primaryColor;
          setPrimaryColor(secondaryColor);
          setSecondaryColor(temp);
          soundEngine.playPixelDraw();
          break;
        }
        case '+':
        case '=':
          setZoom((z) => Math.min(3.5, z + 0.25));
          break;
        case '-':
          setZoom((z) => Math.max(0.5, z - 0.25));
          break;
        case '0':
          setZoom(1);
          setPanOffset({ x: 0, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [primaryColor, secondaryColor, undoStack, redoStack, canvasPixels]);

  // Is drawing enabled? (In Guess & Draw, only the drawer can draw while in drawing state)
  const isDrawingEnabled =
    isSoloStudio ||
    !currentLobby ||
    currentLobby.gameMode === 'collab' ||
    (currentLobby.gameMode === 'speed_battle' && currentLobby.status === 'drawing') ||
    (currentLobby.gameMode === 'guess' && currentLobby.status === 'drawing' && currentLobby.currentDrawerId === player.id);

  const isInLobbyOrSolo = Boolean(currentLobby || isSoloStudio);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col selection:bg-white selection:text-black relative font-sans">
      {/* Floating Emote Overlay */}
      <FloatingEmotes emotes={floatingEmotes} />

      {/* Top Navbar */}
      <Navbar
        currentLobbyId={currentLobby?.id || (isSoloStudio ? 'SOLO STUDIO' : null)}
        lobbyName={currentLobby?.name || (isSoloStudio ? 'Offline Sandbox' : undefined)}
        player={player}
        onUpdatePlayer={handleUpdatePlayer}
        onLeaveLobby={handleLeaveLobby}
        onOpenGallery={() => setShowGalleryModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {!isInLobbyOrSolo ? (
          /* Lobby Browser (Home View) */
          <LobbyBrowser
            onJoinLobby={handleJoinLobby}
            onOpenCreateModal={() => setShowCreateModal(true)}
            onOpenSoloStudio={handleOpenSoloStudio}
            onOpenHelp={() => setShowHelpModal(true)}
          />
        ) : (
          /* Active Studio / Game Room View */
          <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
            {/* Game Status Banner Header (if in lobby) */}
            {currentLobby && (
              <GameHeader
                lobby={currentLobby}
                currentPlayer={player}
                onStartGame={handleStartGame}
                onToggleReady={handleToggleReady}
                onChooseWord={handleChooseWord}
              />
            )}

            {/* If in Speed Battle Voting Arena */}
            {currentLobby && currentLobby.gameMode === 'speed_battle' && currentLobby.status === 'voting' ? (
              <SpeedBattleView
                submissions={currentLobby.speedBattleSubmissions || {}}
                currentPrompt={currentLobby.currentPrompt}
                gridSize={gridSize}
                currentUserId={player.id}
                timeRemaining={currentLobby.timeRemaining}
                onVote={handleSpeedBattleVote}
              />
            ) : (
              /* Canvas & Workstation Layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-start">
                {/* Left Tool Dock */}
                <div className="lg:col-span-1 flex lg:flex-col justify-center">
                  <DrawingToolbar
                    activeTool={activeTool}
                    brushSize={brushSize}
                    gridType={gridType}
                    symmetryMode={symmetryMode}
                    canUndo={undoStack.length > 0}
                    canRedo={redoStack.length > 0}
                    zoom={zoom}
                    onSelectTool={setActiveTool}
                    onChangeBrushSize={setBrushSize}
                    onToggleGrid={() => {
                      const types: ('none' | 'subtle' | 'dots' | 'clear')[] = ['none', 'subtle', 'dots', 'clear'];
                      const next = types[(types.indexOf(gridType) + 1) % types.length];
                      setGridType(next);
                    }}
                    onToggleSymmetry={() => {
                      const modes: ('none' | 'horizontal' | 'vertical' | 'quad')[] = ['none', 'horizontal', 'vertical', 'quad'];
                      const next = modes[(modes.indexOf(symmetryMode) + 1) % modes.length];
                      setSymmetryMode(next);
                    }}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onClearCanvas={handleClearCanvas}
                    onZoomIn={() => setZoom((z) => Math.min(3.5, z + 0.25))}
                    onZoomOut={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                    onResetZoom={() => {
                      setZoom(1);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    onOpenExport={() => setShowExportModal(true)}
                    disabled={!isDrawingEnabled}
                  />
                </div>

                {/* Center Canvas & Palette */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <PixelCanvas
                    gridSize={gridSize}
                    canvasPixels={canvasPixels}
                    activeTool={activeTool}
                    brushSize={brushSize}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    gridType={gridType}
                    zoom={zoom}
                    panOffset={panOffset}
                    symmetryMode={symmetryMode}
                    isDrawingEnabled={isDrawingEnabled}
                    remoteCursors={remoteCursors}
                    onDrawStroke={handleDrawStroke}
                    onPickColor={(col) => {
                      setPrimaryColor(col);
                      if (!recentColors.includes(col)) {
                        setRecentColors((prev) => [col, ...prev.slice(0, 7)]);
                      }
                    }}
                    onCursorMove={handleCursorMove}
                  />

                  {/* Palette Selector */}
                  <PaletteSelector
                    currentPaletteId={currentPaletteId}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    recentColors={recentColors}
                    onChangePalette={setCurrentPaletteId}
                    onSelectPrimaryColor={setPrimaryColor}
                    onSelectSecondaryColor={setSecondaryColor}
                    onSwapColors={() => {
                      const temp = primaryColor;
                      setPrimaryColor(secondaryColor);
                      setSecondaryColor(temp);
                      soundEngine.playPixelDraw();
                    }}
                  />
                </div>

                {/* Right Chat & Player Roster */}
                <div className="lg:col-span-4 h-full">
                  <ChatAndPlayers
                    lobby={
                      currentLobby || {
                        id: 'SOLO',
                        name: 'Solo Studio',
                        hostId: player.id,
                        isPrivate: false,
                        gameMode: 'collab',
                        gridSize,
                        maxPlayers: 1,
                        players: { [player.id]: player },
                        canvas: canvasPixels,
                        currentRound: 1,
                        totalRounds: 1,
                        roundTime: 60,
                        timeRemaining: 60,
                        status: 'waiting',
                        currentDrawerId: player.id,
                        currentPrompt: null,
                        paletteId: currentPaletteId,
                        createdAt: Date.now(),
                        lastActivity: Date.now(),
                      }
                    }
                    currentPlayer={player}
                    chatMessages={chatMessages}
                    onSendMessage={handleSendMessage}
                    onSendEmote={handleSendEmote}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateLobbyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateLobby}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        canvasPixels={canvasPixels}
        gridSize={gridSize}
        authorName={player.name}
        gameMode={currentLobby?.gameMode || 'solo'}
        onSaveToGallery={handleSaveToGallery}
      />

      <GalleryModal
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
        savedArtworks={savedArtworks}
        onDeleteArt={handleDeleteArt}
        onLoadArt={handleLoadArt}
      />

      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      <GameOverModal
        isOpen={showGameOverModal}
        scores={gameOverScores}
        isHost={currentLobby?.hostId === player.id}
        onPlayAgain={() => {
          setShowGameOverModal(false);
          handleStartGame();
        }}
        onReturnToLobby={() => {
          setShowGameOverModal(false);
          handleLeaveLobby();
        }}
      />
    </div>
  );
}
