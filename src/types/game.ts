export type GameMode = 'collab' | 'guess' | 'speed_battle' | 'relay';

export type LobbyStatus = 
  | 'waiting' 
  | 'choosing_word' 
  | 'drawing' 
  | 'voting' 
  | 'round_end' 
  | 'game_over';

export interface Player {
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

export interface SpeedBattleSubmission {
  playerId: string;
  playerName: string;
  avatar: string;
  color: string;
  canvas: string[];
  votes: number;
  votedBy: string[];
}

export interface Lobby {
  id: string;
  name: string;
  hostId: string;
  isPrivate: boolean;
  gameMode: GameMode;
  gridSize: number; // 16, 24, 32, 48
  maxPlayers: number;
  players: Record<string, Player>;
  canvas: string[]; // 1D array of hex strings (length = gridSize * gridSize)
  currentRound: number;
  totalRounds: number;
  roundTime: number; // seconds
  timeRemaining: number;
  status: LobbyStatus;
  currentDrawerId: string | null;
  currentPrompt: string | null;
  promptCategory?: string;
  promptOptions?: string[];
  speedBattleSubmissions?: Record<string, SpeedBattleSubmission>;
  paletteId: string;
  createdAt: number;
  lastActivity: number;
}

export interface LobbySummary {
  id: string;
  name: string;
  hostName: string;
  isPrivate: boolean;
  gameMode: GameMode;
  gridSize: number;
  playerCount: number;
  maxPlayers: number;
  status: LobbyStatus;
  paletteId: string;
}

export type ChatMessageType = 
  | 'chat' 
  | 'guess_correct' 
  | 'guess_close' 
  | 'system' 
  | 'join' 
  | 'leave' 
  | 'round_start' 
  | 'game_win';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  type: ChatMessageType;
  timestamp: number;
}

export type ToolType = 
  | 'pencil' 
  | 'eraser' 
  | 'bucket' 
  | 'eyedropper' 
  | 'line' 
  | 'rect' 
  | 'rect_filled'
  | 'circle' 
  | 'circle_filled'
  | 'dither' 
  | 'shade_light' 
  | 'shade_dark';

export interface PixelChange {
  index: number;
  color: string;
}

export interface StrokeData {
  changes: PixelChange[];
  tool: ToolType;
  color: string;
  playerId: string;
}

export interface RemoteCursor {
  x: number;
  y: number;
  playerId: string;
  playerName: string;
  color: string;
  tool: ToolType;
  updatedAt: number;
}

export interface FloatingEmote {
  id: string;
  emoji: string;
  x: number;
  y: number;
  senderName: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

export interface SavedPixelArt {
  id: string;
  title: string;
  gridSize: number;
  pixels: string[];
  createdAt: number;
  author: string;
  mode: string;
}
