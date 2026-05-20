export interface Player {
    id: number;
    name: string,
    email: string,
    username: string,
    created_at: string
}

export interface Game {
    id: number;
    external_id: number;
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
    hours_played: number;
    date_purchased: string;
    completion_status: string;
    rating: number;
    is_favorite: boolean;
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

export const CompletionStatus = {
    NOT_STARTED: "not_started",
    PLAYING: "playing",
    COMPLETED: "completed",
    DROPPED: "dropped",
    ON_HOLD: "on_hold",
    ENDLESS: "endless",
    PLATINUM: "platinum",
};

const completionStatuses: string[] = [
    CompletionStatus.NOT_STARTED,
    CompletionStatus.PLAYING,
    CompletionStatus.COMPLETED,
    CompletionStatus.DROPPED,
    CompletionStatus.ON_HOLD,
    CompletionStatus.ENDLESS,
    CompletionStatus.PLATINUM,
];

export {completionStatuses};