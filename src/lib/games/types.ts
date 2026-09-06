export interface Game {
  id: string;
  name: string;
  description: string;
  minPlayers?: number;
  maxPlayers?: number;
  estimatedMinutes?: number;
}
