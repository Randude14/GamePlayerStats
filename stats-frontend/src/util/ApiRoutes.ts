const ApiRoutes = {
    CREATE_PLAYER: '/players',
    AUTH_PLAYER: '/auth/login',
    GET_PLAYER_ME_INFO: '/players/me',
    GET_ALL_PLAYERS: '/players',
    DELETE_PLAYERS: '/players',
    UPDATE_PLAYER_USERNAME: '/players/me/username',
    UPDATE_PLAYER_NAME: '/players/me/name',
    UPDATE_PLAYER_EMAIL: '/players/me/email',
    UPDATE_PLAYER_PASSWORD: '/players/me/password',

    GET_ALL_GAMES: '/games',
    GET_GAME_BY_TITLE_RELEASE: '', //Remove
    GET_GAME_BY_ID: '/games/id/{0}',
    CREATE_GAME: '/games',
    DELETE_GAME: '/games/{0}',
    GAME_EXTERNAL_SEARCH: '/games/external/search',
    GAME_INTERNAL_SEARCH: '/games/internal/search',
    GAME_IMPORT_EXTERNAL: '/games/external/import/{0}',

    GET_ALL_PLAYER_STATS: '/player_stats/all',
    SEARCH_PLAYER_STATS: '/player_stats/all/search',
    GET_PLAYER_DASHBOARD: '/player_stats/dashboard/{0}',
    ADD_PLAYER_STAT: '/player_stats',
    UPDATE_PLAYER_STAT: '/player_stats/{0}',
    GET_STAT_FROM_PLAYER_AND_GAME: '/player_stats/search/{0}/game/{1}',
    GET_STATS_FROM_PLAYER: '/player_stats/search/{0}',
    SEARCH_PLAYER_STATS_ME: '/player_stats/me/search',
    DELETE_PLAYER_STAT: '/player_stats/'
}

export { ApiRoutes };