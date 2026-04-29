import {
	createContext,
	useContext,
	type ReactNode,
} from "react";

import { useToast } from "./ToastContext";
import { useAuth } from "./useAuth";
import {  HttpMethod } from "../util/serverRequests";
import type { PlayerDashboard, RowObject, SearchResults } from "../util/Models";
import { authPlayerRequest, createPlayerRequest, getPlayerDashboardRequest, importExternalGameRequest, searchResultsRequest, updatePlayerFieldRequest, updatePlayerPasswordRequest } from "./apiService";
import { ApiRoutes } from "../util/ApiRoutes";

type ApiContextValue = {
	createPlayer: (
		name: string,
		username: string,
		email: string,
		password: string
	) => Promise<boolean>;

	authPlayer: (
		email: string,
		password: string
	) => Promise<boolean>;

	getPlayerDashboard: (
		userId: number
	) => Promise<PlayerDashboard | null>;

	getSearchResults: <T extends RowObject> (
		route: string, httpMethod: 
        typeof HttpMethod[keyof typeof HttpMethod], 
        auth: boolean, 
		searchParams: URLSearchParams
	) => Promise<SearchResults<T> | null>

	updatePlayerName: (
		value: string
	) => Promise<boolean>

	updatePlayerUsername: (
		value: string
	) => Promise<boolean>

	updatePlayerPassword: (
		oldPassword: string,
		newPassword: string
	) => Promise<boolean>

	importExternalGame: (
		game_external_id: number
	) => Promise<boolean>
};

const ApiContext = createContext<ApiContextValue | null>(null);

type ApiProviderProps = {
	children: ReactNode;
};

export function ApiProvider({ children }: ApiProviderProps) {
	const { toast } = useToast();
	const { login, logout } = useAuth();

	async function runApi<T>(
		request: () => Promise<T>,
		options?: {
			successMessage?: string;
			errorMessage?: string;
			onSuccess?: (data: T) => void;
			onError?: () => void;
		}
	): Promise<T | null> {
		try {
			const data = await request();

			if (options?.onSuccess) {
				options.onSuccess(data);
			}

			if (options?.successMessage) {
				toast.success(options.successMessage);
			}

			return data;
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: options?.errorMessage ?? "An unknown error occurred.";

			options?.onError?.();
			toast.error(message);

			return null;
		}
	}

	const createPlayer = async (
		name: string,
		username: string,
		email: string,
		password: string
	): Promise<boolean> => {
		const data = await runApi(
			() => createPlayerRequest(name, username, email, password),
			{
				successMessage: "Account created!",
				onSuccess: login
			}
		);

		return data !== null;
	};

	const authPlayer = async (
		email: string,
		password: string
	): Promise<boolean> => {
		const data = await runApi(
			() => authPlayerRequest(email, password),
			{
				successMessage: "Welcome back!",
				onSuccess: login,
				onError: logout,
			}
		);

		return data !== null;
	};

	const getPlayerDashboard = async (
		userId: number
	): Promise<PlayerDashboard | null> => await runApi( () => getPlayerDashboardRequest(userId) )

	const getSearchResults = async <T extends RowObject> (
		route: string, httpMethod: 
        typeof HttpMethod[keyof typeof HttpMethod], 
        auth: boolean, 
		searchParams: URLSearchParams
	) : Promise< SearchResults<T> > => {
		const searchRestuls: SearchResults<T> = await runApi(
			() => searchResultsRequest(route, httpMethod, auth, searchParams)
		);
		return searchRestuls;
	}

	const updatePlayerName = async (
		value: string
 	) : Promise<boolean> => await runApi( () => updatePlayerFieldRequest(ApiRoutes.UPDATE_PLAYER_NAME, 'name', value),
		{
			successMessage: "Name updated."
		}

	);

	const updatePlayerUsername = async (
		value: string
 	) : Promise<boolean> => await runApi( () => updatePlayerFieldRequest(ApiRoutes.UPDATE_PLAYER_USERNAME, 'username', value),
		{
			successMessage: "Username updated."
		}
	);

	const updatePlayerPassword = async (
		oldPassword: string,
		newPassword: string
 	) : Promise<boolean> => await runApi( () => updatePlayerPasswordRequest(oldPassword, newPassword),
		{
			successMessage: "Password updated."
		}
	);

	const importExternalGame = async (
		game_external_id: number
 	) : Promise<boolean> => await runApi( () => importExternalGameRequest(game_external_id),
		{
			successMessage: "Game imported."
		}
	);	

	const api: ApiContextValue = {
		createPlayer,
		authPlayer,
		getSearchResults,
		getPlayerDashboard,
		updatePlayerName,
		updatePlayerUsername,
		updatePlayerPassword,
		importExternalGame
	};

	return (
		<ApiContext.Provider value={api}>
			{children}
		</ApiContext.Provider>
	);
}

export function useApi() {
	const context = useContext(ApiContext);

	if (!context) {
		throw new Error("useApi must be used within ApiProvider");
	}

	return context;
}