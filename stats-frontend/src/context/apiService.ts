import { ApiRoutes } from "../util/ApiRoutes";
import type { Game, PlayerDashboard, PlayerStat, RowObject, SearchResults } from "../util/Models";
import { buildUrl, fetchURLWithAuth, fetchURLWithNoAuth, fetchWithAuth, fetchWithNoAuth, HttpMethod } from "../util/serverRequests";

export class ApiServiceError extends Error {

    constructor(data: any, backupMessage: string) {
        super(
            data.message ??
			data.msg ??
			data.errors?.[0]?.msg ??
			backupMessage
        );
    }
}

export function formatRoute(
	route: string,
	...args: Array<string | number>
): string {
	return route.replace(/{(\d+)}/g, (match, index) => {
		const value = args[Number(index)];

		if (value === undefined || value === null) {
			throw new Error(`Missing route param for ${match} in ${route}`);
		}

		return encodeURIComponent(String(value));
	});
}



export async function authPlayerRequest(email: string, password: string) {
	const body = JSON.stringify({ email, password });

	const res = await fetchWithNoAuth(
		ApiRoutes.AUTH_PLAYER,
		HttpMethod.POST,
		body
	);

	const data = await res.json();

	if (!res.ok) {
		throw new ApiServiceError(data, 'Invalid credentials.');
	}

	return data;
}

export async function getPlayerDashboardRequest(userId: number): Promise<PlayerDashboard> {
    const url = formatRoute(ApiRoutes.GET_PLAYER_DASHBOARD, userId);

    const res = await fetchWithNoAuth(url, HttpMethod.GET);
    const data = await res.json();

    if (!res.ok) {
		throw new ApiServiceError(data, `Failed to get dashboard information.`);
    }
    
    return data as PlayerDashboard;
}

export async function createPlayerRequest(name: string, username: string, email: string, password: string): Promise<boolean> {
    const body = JSON.stringify({ name, username, email, password });

    const res = await fetchWithNoAuth(
        ApiRoutes.CREATE_PLAYER,
        HttpMethod.POST,
        body
    );

    const data = await res.json();

    if (!res.ok) {
        throw new ApiServiceError(data, "Failed to create account.");
    }

    return true;
}

export async function searchResultsRequest<T extends RowObject>(route: string, httpMethod: 
                    typeof HttpMethod[keyof typeof HttpMethod], 
                    auth: boolean, searchParams: URLSearchParams): Promise<SearchResults<T>> {

    const url = new URL( buildUrl(route) );
    
    for(const key of searchParams.keys()) {
        url.searchParams.set(key, searchParams.get(key));
    }

    const endpointFetch = auth ? fetchURLWithAuth : fetchURLWithNoAuth;
    const res = await endpointFetch(url.toString(), httpMethod || HttpMethod.GET);

    const data: Promise<any> = await res.json();
    const searchResults: SearchResults<T> = data as SearchResults<T>;

    if (!res.ok) {
        throw new ApiServiceError(data, 'Failed to load search results.');
    }

    return searchResults;
}


export async function updatePlayerFieldRequest(route: string, fieldName: string, value: string): Promise<boolean> {

    const body = JSON.stringify({
        [fieldName]: value
    });

    const res = await fetchWithAuth(route, HttpMethod.PATCH, body);
    const data = await res.json();

    if(!res.ok) {
        throw new ApiServiceError(data, 'Failed to update.');
    }

    return true;
}

export async function updatePlayerPasswordRequest(oldPassword: string, newPassword: string): Promise<boolean> {

    const body = JSON.stringify({
        'old_password': oldPassword,
        'new_password': newPassword,
    });

    const res = await fetchWithAuth(ApiRoutes.UPDATE_PLAYER_PASSWORD, HttpMethod.PATCH, body);
    const data = await res.json();

    if(!res.ok) {
        throw new ApiServiceError(data, 'Failed to update password.');
    }

    return true;
}

export async function importExternalGameRequest(game_external_id: number): Promise<boolean> {
    const res = await fetchWithAuth( formatRoute(ApiRoutes.GAME_IMPORT_EXTERNAL, game_external_id), HttpMethod.PUT);
    const data = await res.json();

    if(!res.ok) {
        throw new ApiServiceError(data, 'Failed to import game.');
    }

    return true;
}

export async function getGameByIdRequest(gameId: number): Promise<Game> {
    const res = await fetchWithAuth( formatRoute(ApiRoutes.GET_GAME_BY_ID, gameId), HttpMethod.GET );
    const data = await res.json();

    if(!res.ok) {
        throw new ApiServiceError(data, 'Could not find game.');
    }

    return data as Game;
}

export async function updatePlayerStatRequest(stat_id: number, date_purchased: string, hours_played: number): Promise<boolean> {
    const body: string = JSON.stringify({ date_purchased, hours_played });
    const res = await fetchWithAuth( formatRoute(ApiRoutes.UPDATE_PLAYER_STAT, stat_id), HttpMethod.PATCH, body );
    const data = await res.json();

    if(!res.ok) {
        throw new ApiServiceError(data, 'Failed to update player stat.');
    }

    return true;
}

export async function addPlayerStatRequest(game_id: number, date_purchased: string, hours_played: number): Promise<boolean> {
    const body: string = JSON.stringify({ game_id, date_purchased, hours_played });
    const res = await fetchWithAuth( ApiRoutes.ADD_PLAYER_STAT, HttpMethod.POST, body );
    const data = await res.json();

    if(!res.ok) {
        throw new ApiServiceError(data, 'Failed to add player stat.');
    }

    return true;
}

export async function getPlayerStatRequest(player_id: number, game_id: number, silentFailure?: boolean): Promise<PlayerStat> {
    const res = await fetchWithAuth( formatRoute(ApiRoutes.GET_STAT_FROM_PLAYER_AND_GAME, player_id, game_id), HttpMethod.GET );
    const data = await res.json();

    // Silent failure flag
    if(!res.ok && !silentFailure) {
        throw new ApiServiceError(data, 'Failed to find player stat.');
    }

    return data as PlayerStat;
}

export async function playerStatFavoriteRequest(stat_id: number, is_favorite: boolean): Promise<PlayerStat> {
    const apiRoute: string = is_favorite ? ApiRoutes.FAVORITE_PLAYER_STAT : ApiRoutes.UNFAVORITE_PLAYER_STAT;
    const res = await fetchWithAuth( formatRoute(apiRoute, stat_id), HttpMethod.PATCH );
    const data = await res.json();

    if(!res.ok) {
        throw new ApiServiceError(data, 'Failed to like player stat.');
    }

    return data as PlayerStat;
}

export async function deletePlayerStatRequest(stat_id: number): Promise<PlayerStat> {
    const res = await fetchWithAuth( formatRoute(ApiRoutes.DELETE_PLAYER_STAT, stat_id), HttpMethod.DELETE );
    const data = await res.json();

    if(!res.ok) {
        throw new ApiServiceError(data, 'Failed to delete player stat.');
    }

    return data as PlayerStat;
}