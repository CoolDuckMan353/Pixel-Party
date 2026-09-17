import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  isHost: boolean;
  isReady: boolean;
  hasGuessed: boolean;
  isDrawer: boolean;
  lastActive: number;
}

interface SpeedBattleSubmission {
  playerId: string;
  playerName: string;
  avatar: string;
  color: string;
  canvas: string[];
  votes: number;
  votedBy: string[];
}

interface Lobby {
  id: string;
  name: string;
  hostId: string;
  isPrivate: boolean;
  gameMode: 'collab' | 'guess' | 'speed_battle' | 'relay';
  gridSize: number;
  maxPlayers: number;
  players: Record<string, Player>;
  canvas: string[];
  currentRound: number;
  totalRounds: number;
  roundTime: number;
  timeRemaining: number;
  status: 'waiting' | 'choosing_word' | 'drawing' | 'voting' | 'round_end' | 'game_over';
  currentDrawerId: string | null;
  currentPrompt: string | null;
  promptCategory?: string;
  promptOptions?: string[];
  speedBattleSubmissions?: Record<string, SpeedBattleSubmission>;
  paletteId: string;
  createdAt: number;
  lastActivity: number;
}

const DEFAULT_WORDS = [
  { word: 'Cat', category: 'Animals' },
  { word: 'Duck', category: 'Animals' },
  { word: 'Penguin', category: 'Animals' },
  { word: 'Axolotl', category: 'Animals' },
  { word: 'Octopus', category: 'Animals' },
  { word: 'Pizza', category: 'Food' },
  { word: 'Donut', category: 'Food' },
  { word: 'Boba Tea', category: 'Food' },
  { word: 'Sushi', category: 'Food' },
  { word: 'Sword', category: 'Gaming' },
  { word: 'Potion', category: 'Gaming' },
  { word: 'Arcade', category: 'Gaming' },
  { word: 'Rocket', category: 'Sci-Fi' },
  { word: 'Alien', category: 'Sci-Fi' },
  { word: 'UFO', category: 'Sci-Fi' },
  { word: 'Wizard Hat', category: 'Fantasy' },
  { word: 'Campfire', category: 'Nature' },
  { word: 'Cactus', category: 'Nature' },
  { word: 'Rainbow', category: 'Nature' }
];

const lobbies: Record<string, Lobby> = {};
const clientSockets = new Map<WebSocket, { lobbyId?: string; playerId?: string }>();

// Prepopulate some active public lobby rooms for instant fun!
function initDefaultLobbies() {
  const defaultLobby1: Lobby = {
    id: 'PUBLIC-LOUNGE',
    name: '🎨 Public Pixel Lounge',
    hostId: 'system',
    isPrivate: false,
    gameMode: 'collab',
    gridSize: 32,
    maxPlayers: 12,
    players: {},
    canvas: new Array(32 * 32).fill(''),
    currentRound: 1,
    totalRounds: 3,
    roundTime: 60,
    timeRemaining: 60,
    status: 'waiting',
    currentDrawerId: null,
    currentPrompt: null,
    paletteId: 'pico-8',
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };

  const defaultLobby2: Lobby = {
    id: 'GUESS-ARENA',
    name: '🎯 Pixel Guess Party',
    hostId: 'system',
    isPrivate: false,
    gameMode: 'guess',
    gridSize: 32,
    maxPlayers: 8,
    players: {},
    canvas: new Array(32 * 32).fill(''),
    currentRound: 1,
    totalRounds: 4,
    roundTime: 60,
    timeRemaining: 60,
    status: 'waiting',
    currentDrawerId: null,
    currentPrompt: null,
    paletteId: 'mega',
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };

  lobbies[defaultLobby1.id] = defaultLobby1;
  lobbies[defaultLobby2.id] = defaultLobby2;
}

initDefaultLobbies();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // REST API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', lobbiesCount: Object.keys(lobbies).length });
  });

  // Get public lobbies
  app.get('/api/lobbies', (req, res) => {
    const list = Object.values(lobbies)
      .filter((l) => !l.isPrivate)
      .map((l) => ({
        id: l.id,
        name: l.name,
        hostName: l.players[l.hostId]?.name || 'System / Open',
        isPrivate: l.isPrivate,
        gameMode: l.gameMode,
        gridSize: l.gridSize,
        playerCount: Object.keys(l.players).length,
        maxPlayers: l.maxPlayers,
        status: l.status,
        paletteId: l.paletteId,
      }));
    res.json(list);
  });

  // Create a new lobby
  app.post('/api/lobbies', (req, res) => {
    const { name, gameMode, gridSize, maxPlayers, isPrivate, paletteId, roundTime, totalRounds } = req.body;
    const cleanGridSize = [16, 24, 32, 48].includes(Number(gridSize)) ? Number(gridSize) : 32;
    
    // Generate clean 6-character room code e.g. PIX-742
    const code = 'PIX-' + Math.floor(100 + Math.random() * 900);
    const newLobby: Lobby = {
      id: code,
      name: (name || 'Pixel Lounge').trim().slice(0, 30),
      hostId: '',
      isPrivate: Boolean(isPrivate),
      gameMode: ['collab', 'guess', 'speed_battle', 'relay'].includes(gameMode) ? gameMode : 'collab',
      gridSize: cleanGridSize,
      maxPlayers: Math.min(12, Math.max(2, Number(maxPlayers) || 8)),
      players: {},
      canvas: new Array(cleanGridSize * cleanGridSize).fill(''),
      currentRound: 1,
      totalRounds: Math.min(10, Math.max(1, Number(totalRounds) || 3)),
      roundTime: Math.min(180, Math.max(30, Number(roundTime) || 60)),
      timeRemaining: Math.min(180, Math.max(30, Number(roundTime) || 60)),
      status: 'waiting',
      currentDrawerId: null,
      currentPrompt: null,
      paletteId: paletteId || 'pico-8',
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    lobbies[code] = newLobby;
    res.json(newLobby);
  });

  // Get single lobby info
  app.get('/api/lobbies/:id', (req, res) => {
    const lobby = lobbies[req.params.id.toUpperCase()];
    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }
    res.json(lobby);
  });

  // AI Prompt Helper endpoint
  app.post('/api/ai/suggest-words', async (req, res) => {
    const theme = req.body.theme || 'retro pixel art';
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = DEFAULT_WORDS.sort(() => 0.5 - Math.random()).slice(0, 6);
      return res.json({ words: fallback.map((w) => w.word) });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 6 fun, single or two-word concepts suitable for pixel art drawing game based on the theme "${theme}". Return only a JSON array of strings like ["Dragon", "Ice Cream", "Space Alien"].`,
        config: { responseMimeType: 'application/json' },
      });
      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({ words: parsed.slice(0, 6) });
      }
    } catch (e) {
      console.error('AI suggest error:', e);
    }
    const fallback = DEFAULT_WORDS.sort(() => 0.5 - Math.random()).slice(0, 6);
    res.json({ words: fallback.map((w) => w.word) });
  });

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize WebSocket Server
  const wss = new WebSocketServer({ server });

  function broadcastToLobby(lobbyId: string, event: string, payload: unknown, excludeSocket?: WebSocket) {
    const message = JSON.stringify({ event, payload });
    for (const [ws, data] of clientSockets.entries()) {
      if (data.lobbyId === lobbyId && ws !== excludeSocket && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }

  function getLobbyPlayers(lobby: Lobby): Player[] {
    return Object.values(lobby.players);
  }

  function advanceTurnOrRound(lobby: Lobby) {
    const playerList = getLobbyPlayers(lobby);
    if (playerList.length === 0) {
      lobby.status = 'waiting';
      return;
    }

    if (lobby.gameMode === 'guess') {
      // Find next drawer
      const currentIndex = playerList.findIndex((p) => p.id === lobby.currentDrawerId);
      const nextIndex = (currentIndex + 1) % playerList.length;
      
      // If we wrapped around, advance round
      if (nextIndex === 0 && currentIndex !== -1) {
        lobby.currentRound += 1;
        if (lobby.currentRound > lobby.totalRounds) {
          lobby.status = 'game_over';
          broadcastToLobby(lobby.id, 'game_over', {
            scores: playerList.map((p) => ({ id: p.id, name: p.name, score: p.score, avatar: p.avatar, color: p.color })),
          });
          return;
        }
      }

      const nextDrawer = playerList[nextIndex];
      lobby.currentDrawerId = nextDrawer.id;
      playerList.forEach((p) => {
        p.isDrawer = p.id === nextDrawer.id;
        p.hasGuessed = false;
      });

      // Clear canvas for new turn
      lobby.canvas = new Array(lobby.gridSize * lobby.gridSize).fill('');
      
      // Pick 3 prompt options
      const shuffled = [...DEFAULT_WORDS].sort(() => 0.5 - Math.random());
      lobby.promptOptions = shuffled.slice(0, 3).map((w) => w.word);
      lobby.status = 'choosing_word';
      lobby.timeRemaining = 15; // 15s to choose word

      broadcastToLobby(lobby.id, 'turn_start', {
        drawerId: nextDrawer.id,
        drawerName: nextDrawer.name,
        promptOptions: lobby.promptOptions,
        currentRound: lobby.currentRound,
        totalRounds: lobby.totalRounds,
      });
    } else if (lobby.gameMode === 'speed_battle') {
      if (lobby.status === 'drawing') {
        // Move to voting phase
        lobby.status = 'voting';
        lobby.timeRemaining = 30; // 30s to vote
        broadcastToLobby(lobby.id, 'voting_start', {
          submissions: lobby.speedBattleSubmissions,
          timeRemaining: 30,
        });
      } else if (lobby.status === 'voting') {
        // Tally votes
        lobby.currentRound += 1;
        if (lobby.currentRound > lobby.totalRounds) {
          lobby.status = 'game_over';
          broadcastToLobby(lobby.id, 'game_over', {
            scores: playerList.map((p) => ({ id: p.id, name: p.name, score: p.score, avatar: p.avatar, color: p.color })),
          });
        } else {
          lobby.status = 'waiting';
          broadcastToLobby(lobby.id, 'round_end', { lobby });
        }
      }
    }
  }

  // 1-second server ticker for active games
  setInterval(() => {
    for (const lobby of Object.values(lobbies)) {
      if (['choosing_word', 'drawing', 'voting'].includes(lobby.status)) {
        lobby.timeRemaining = Math.max(0, lobby.timeRemaining - 1);

        broadcastToLobby(lobby.id, 'timer_tick', {
          timeRemaining: lobby.timeRemaining,
          status: lobby.status,
        });

        if (lobby.timeRemaining <= 0) {
          if (lobby.status === 'choosing_word') {
            // Auto pick word
            const autoWord = lobby.promptOptions?.[0] || 'Star';
            lobby.currentPrompt = autoWord;
            lobby.status = 'drawing';
            lobby.timeRemaining = lobby.roundTime;
            broadcastToLobby(lobby.id, 'word_chosen', {
              drawerId: lobby.currentDrawerId,
              promptLength: autoWord.length,
              timeRemaining: lobby.roundTime,
            });
          } else if (lobby.status === 'drawing') {
            // Drawing time is up!
            if (lobby.gameMode === 'guess') {
              broadcastToLobby(lobby.id, 'round_timeout', {
                revealedWord: lobby.currentPrompt,
              });
              lobby.status = 'round_end';
              lobby.timeRemaining = 5;
              setTimeout(() => {
                advanceTurnOrRound(lobby);
              }, 4000);
            } else if (lobby.gameMode === 'speed_battle') {
              advanceTurnOrRound(lobby);
            }
          } else if (lobby.status === 'voting') {
            advanceTurnOrRound(lobby);
          }
        }
      }
    }
  }, 1000);

  wss.on('connection', (ws) => {
    clientSockets.set(ws, {});

    ws.on('message', (rawData) => {
      try {
        const msg = JSON.parse(rawData.toString());
        const { event, payload } = msg;
        const clientData = clientSockets.get(ws) || {};

        switch (event) {
          case 'join_lobby': {
            const { lobbyId, player } = payload;
            let lobby = lobbies[lobbyId?.toUpperCase()];

            if (!lobby) {
              // Create on-demand if user requested custom code
              const cleanCode = (lobbyId || 'ROOM-1').toUpperCase();
              lobby = {
                id: cleanCode,
                name: `Lobby ${cleanCode}`,
                hostId: player.id,
                isPrivate: false,
                gameMode: 'collab',
                gridSize: 32,
                maxPlayers: 8,
                players: {},
                canvas: new Array(32 * 32).fill(''),
                currentRound: 1,
                totalRounds: 3,
                roundTime: 60,
                timeRemaining: 60,
                status: 'waiting',
                currentDrawerId: null,
                currentPrompt: null,
                paletteId: 'pico-8',
                createdAt: Date.now(),
                lastActivity: Date.now(),
              };
              lobbies[cleanCode] = lobby;
            }

            // Assign host if first player or system lobby
            const isFirst = Object.keys(lobby.players).length === 0 || lobby.hostId === 'system';
            const joinedPlayer: Player = {
              id: player.id,
              name: player.name || `Artist #${Math.floor(100 + Math.random() * 900)}`,
              avatar: player.avatar || '🎨',
              color: player.color || '#3b82f6',
              score: 0,
              isHost: isFirst ? true : lobby.hostId === player.id,
              isReady: false,
              hasGuessed: false,
              isDrawer: false,
              lastActive: Date.now(),
            };

            if (isFirst) {
              lobby.hostId = player.id;
            }

            lobby.players[player.id] = joinedPlayer;
            lobby.lastActivity = Date.now();
            clientSockets.set(ws, { lobbyId: lobby.id, playerId: player.id });

            // Send full lobby state to joining player
            ws.send(
              JSON.stringify({
                event: 'lobby_state',
                payload: {
                  lobby,
                  playerId: player.id,
                },
              })
            );

            // Broadcast join to others
            broadcastToLobby(
              lobby.id,
              'player_joined',
              {
                player: joinedPlayer,
                players: lobby.players,
              },
              ws
            );
            break;
          }

          case 'ready_toggle': {
            const { lobbyId, playerId, isReady } = payload;
            const lobby = lobbies[lobbyId];
            if (lobby && lobby.players[playerId]) {
              lobby.players[playerId].isReady = isReady;
              broadcastToLobby(lobby.id, 'player_updated', {
                player: lobby.players[playerId],
                players: lobby.players,
              });
            }
            break;
          }

          case 'start_game': {
            const { lobbyId, playerId } = payload;
            const lobby = lobbies[lobbyId];
            if (lobby && (lobby.hostId === playerId || lobby.hostId === 'system')) {
              lobby.currentRound = 1;
              lobby.speedBattleSubmissions = {};

              // Reset player scores
              Object.values(lobby.players).forEach((p) => {
                p.score = 0;
                p.hasGuessed = false;
              });

              if (lobby.gameMode === 'guess') {
                const playerList = getLobbyPlayers(lobby);
                if (playerList.length > 0) {
                  lobby.currentDrawerId = playerList[0].id;
                  playerList[0].isDrawer = true;
                  const shuffled = [...DEFAULT_WORDS].sort(() => 0.5 - Math.random());
                  lobby.promptOptions = shuffled.slice(0, 3).map((w) => w.word);
                  lobby.status = 'choosing_word';
                  lobby.timeRemaining = 15;
                  lobby.canvas = new Array(lobby.gridSize * lobby.gridSize).fill('');

                  broadcastToLobby(lobby.id, 'turn_start', {
                    drawerId: playerList[0].id,
                    drawerName: playerList[0].name,
                    promptOptions: lobby.promptOptions,
                    currentRound: 1,
                    totalRounds: lobby.totalRounds,
                  });
                }
              } else if (lobby.gameMode === 'speed_battle') {
                const promptObj = DEFAULT_WORDS[Math.floor(Math.random() * DEFAULT_WORDS.length)];
                lobby.currentPrompt = promptObj.word;
                lobby.promptCategory = promptObj.category;
                lobby.status = 'drawing';
                lobby.timeRemaining = lobby.roundTime;
                lobby.canvas = new Array(lobby.gridSize * lobby.gridSize).fill('');

                broadcastToLobby(lobby.id, 'speed_battle_start', {
                  prompt: lobby.currentPrompt,
                  category: lobby.promptCategory,
                  timeRemaining: lobby.roundTime,
                  currentRound: 1,
                  totalRounds: lobby.totalRounds,
                });
              } else {
                lobby.status = 'drawing';
                broadcastToLobby(lobby.id, 'collab_started', { lobby });
              }
            }
            break;
          }

          case 'choose_word': {
            const { lobbyId, playerId, word } = payload;
            const lobby = lobbies[lobbyId];
            if (lobby && lobby.currentDrawerId === playerId && lobby.status === 'choosing_word') {
              lobby.currentPrompt = word;
              lobby.status = 'drawing';
              lobby.timeRemaining = lobby.roundTime;

              broadcastToLobby(lobby.id, 'word_chosen', {
                drawerId: playerId,
                promptLength: word.length,
                timeRemaining: lobby.roundTime,
                category: DEFAULT_WORDS.find((w) => w.word.toLowerCase() === word.toLowerCase())?.category || 'General',
              });
            }
            break;
          }

          case 'draw_stroke': {
            const { lobbyId, playerId, changes } = payload;
            const lobby = lobbies[lobbyId];
            if (lobby && Array.isArray(changes)) {
              // Apply changes to authoritative canvas
              for (const change of changes) {
                if (change.index >= 0 && change.index < lobby.canvas.length) {
                  lobby.canvas[change.index] = change.color;
                }
              }
              lobby.lastActivity = Date.now();

              // Broadcast stroke to all other clients
              broadcastToLobby(lobbyId, 'stroke_applied', { playerId, changes }, ws);
            }
            break;
          }

          case 'clear_canvas': {
            const { lobbyId, playerId } = payload;
            const lobby = lobbies[lobbyId];
            if (lobby) {
              lobby.canvas = new Array(lobby.gridSize * lobby.gridSize).fill('');
              broadcastToLobby(lobbyId, 'canvas_cleared', { playerId });
            }
            break;
          }

          case 'cursor_move': {
            const { lobbyId, cursor } = payload;
            if (lobbyId && cursor) {
              broadcastToLobby(lobbyId, 'cursor_updated', { cursor }, ws);
            }
            break;
          }

          case 'send_chat': {
            const { lobbyId, playerId, text } = payload;
            const lobby = lobbies[lobbyId];
            if (!lobby || !text || !text.trim()) return;

            const player = lobby.players[playerId];
            if (!player) return;

            const cleanText = text.trim();

            // Check if Guess & Draw mode and user is guessing the word!
            if (lobby.gameMode === 'guess' && lobby.status === 'drawing' && lobby.currentPrompt) {
              const isDrawer = lobby.currentDrawerId === playerId;
              const hasAlreadyGuessed = player.hasGuessed;

              if (!isDrawer && !hasAlreadyGuessed) {
                const target = lobby.currentPrompt.trim().toLowerCase();
                const guess = cleanText.toLowerCase();

                if (guess === target) {
                  // Correct Guess!
                  player.hasGuessed = true;
                  const pointsEarned = Math.max(50, Math.floor((lobby.timeRemaining / lobby.roundTime) * 150) + 50);
                  player.score += pointsEarned;

                  // Drawer also gets points!
                  if (lobby.currentDrawerId && lobby.players[lobby.currentDrawerId]) {
                    lobby.players[lobby.currentDrawerId].score += 35;
                  }

                  const chatMsg = {
                    id: 'msg-' + Date.now() + '-' + Math.random(),
                    senderId: playerId,
                    senderName: player.name,
                    senderColor: player.color,
                    text: `🎉 Guessed the secret word! (+${pointsEarned} pts)`,
                    type: 'guess_correct' as const,
                    timestamp: Date.now(),
                  };

                  broadcastToLobby(lobbyId, 'chat_received', { message: chatMsg });
                  broadcastToLobby(lobbyId, 'player_guessed', {
                    playerId,
                    playerName: player.name,
                    pointsEarned,
                    scores: Object.values(lobby.players).map((p) => ({ id: p.id, score: p.score })),
                  });

                  // If all non-drawers guessed, end turn early!
                  const nonDrawers = Object.values(lobby.players).filter((p) => p.id !== lobby.currentDrawerId);
                  const allGuessed = nonDrawers.length > 0 && nonDrawers.every((p) => p.hasGuessed);

                  if (allGuessed) {
                    lobby.timeRemaining = 3;
                    broadcastToLobby(lobbyId, 'all_guessed', { timeRemaining: 3 });
                  }
                  return;
                } else if (
                  target.includes(guess) &&
                  guess.length >= Math.max(3, target.length - 2)
                ) {
                  // Close guess alert (sent only to the guesser)
                  ws.send(
                    JSON.stringify({
                      event: 'close_guess_alert',
                      payload: { text: `🔥 "${cleanText}" is very close!` },
                    })
                  );
                }
              }
            }

            // Normal chat message broadcast
            const chatMsg = {
              id: 'msg-' + Date.now() + '-' + Math.random(),
              senderId: playerId,
              senderName: player.name,
              senderColor: player.color,
              text: cleanText,
              type: 'chat' as const,
              timestamp: Date.now(),
            };
            broadcastToLobby(lobbyId, 'chat_received', { message: chatMsg });
            break;
          }

          case 'send_emote': {
            const { lobbyId, emoji, x, y, senderName } = payload;
            if (lobbyId && emoji) {
              broadcastToLobby(lobbyId, 'emote_received', {
                id: 'emote-' + Date.now() + '-' + Math.random(),
                emoji,
                x: x || 50,
                y: y || 50,
                senderName: senderName || 'Player',
              });
            }
            break;
          }

          case 'speed_battle_submit': {
            const { lobbyId, playerId, canvas } = payload;
            const lobby = lobbies[lobbyId];
            if (lobby && lobby.gameMode === 'speed_battle') {
              if (!lobby.speedBattleSubmissions) lobby.speedBattleSubmissions = {};
              const player = lobby.players[playerId];
              if (player) {
                lobby.speedBattleSubmissions[playerId] = {
                  playerId,
                  playerName: player.name,
                  avatar: player.avatar,
                  color: player.color,
                  canvas,
                  votes: 0,
                  votedBy: [],
                };
                broadcastToLobby(lobbyId, 'submission_received', { playerId });
              }
            }
            break;
          }

          case 'speed_battle_vote': {
            const { lobbyId, voterId, targetPlayerId } = payload;
            const lobby = lobbies[lobbyId];
            if (lobby && lobby.speedBattleSubmissions && lobby.speedBattleSubmissions[targetPlayerId]) {
              const target = lobby.speedBattleSubmissions[targetPlayerId];
              if (!target.votedBy.includes(voterId)) {
                target.votes += 1;
                target.votedBy.push(voterId);
                // Award points to the artist
                if (lobby.players[targetPlayerId]) {
                  lobby.players[targetPlayerId].score += 100;
                }
                broadcastToLobby(lobbyId, 'vote_recorded', {
                  targetPlayerId,
                  votes: target.votes,
                  scores: Object.values(lobby.players).map((p) => ({ id: p.id, score: p.score })),
                });
              }
            }
            break;
          }
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    });

    ws.on('close', () => {
      const data = clientSockets.get(ws);
      if (data && data.lobbyId && data.playerId) {
        const lobby = lobbies[data.lobbyId];
        if (lobby && lobby.players[data.playerId]) {
          const leavingName = lobby.players[data.playerId].name;
          delete lobby.players[data.playerId];

          // If host left, reassign host
          if (lobby.hostId === data.playerId) {
            const remaining = Object.keys(lobby.players);
            if (remaining.length > 0) {
              lobby.hostId = remaining[0];
              lobby.players[remaining[0]].isHost = true;
            }
          }

          broadcastToLobby(lobby.id, 'player_left', {
            playerId: data.playerId,
            playerName: leavingName,
            players: lobby.players,
            newHostId: lobby.hostId,
          });
        }
      }
      clientSockets.delete(ws);
    });
  });

  // Vite Middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`PixelParty Game Server running on port ${PORT}`);
  });
}

startServer();
