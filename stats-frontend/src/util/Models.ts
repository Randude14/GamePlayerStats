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
  title: string;
  release: string;
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