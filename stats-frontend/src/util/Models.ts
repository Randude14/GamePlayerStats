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
  developers: string[];
  publishers: string[];
  themes?: string[];
  genres?: string[];
  platforms?: string[];
  player_perspectives?: string[];
  game_modes?: string[];
  game_type?: string;
  release: string;
  cover_url: string;
  created_at: string;
  isImported?: boolean;
  canImport?: boolean;
}

export interface PlayerStat {
  id: number;
  player_id: number;
  game_id: number;
  hours_played: string;
  date_purchased: string;
  created_at: string;
  title?: string;
  release?: string;
}

export interface PlayerDashboard extends Player {
  total_games: number,
  total_hours: number
}

export type RowObject = Record<string, unknown>;
export interface InfoResults<T extends RowObject> {
  results?: T[]
}


export interface SearchResults<T extends RowObject> extends InfoResults<T> {
  query?: string,
  page?: number,
  pageSize?: number,
  totalResults?: number,
  totalPages?: number,
  hasPreviousPage?: boolean,
  hasNextPage?: boolean
}