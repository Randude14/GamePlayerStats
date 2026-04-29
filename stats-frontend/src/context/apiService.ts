import { ApiRoutes } from "../util/ApiRoutes";
import type { PlayerDashboard, RowObject, SearchResults } from "../util/Models";
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