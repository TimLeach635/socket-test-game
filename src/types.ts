export interface PlayerUpdateFromServer {
  id: string;
  x: number;
  y: number;
}

export interface PlayerUpdateFromClient {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  colour: number;
  x: number;
  y: number;
}

export interface GameData {
  players: Player[];
}
