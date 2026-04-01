export interface Player {
  id: number;
  name: string,
  email: string,
  username: string,
  created_at: string
}

export interface Game {
  id: number;
  title: string;
  developer: string;
  publisher: string;
  release: string;
  created_at: string;
}

export interface PlayerStat {
  id: number;
  player_id: number;
  game_id: number;
  hours_played: string;
  date_purchased: string;
  created_at: string;
}