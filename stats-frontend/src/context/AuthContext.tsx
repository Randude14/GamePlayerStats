// src/context/AuthContext.tsx
import { createContext, useState, useEffect, useCallback } from "react";
import type {Player, PlayerStat} from "../util/Models"
import { fetchWithAuth, HttpMethod } from "../util/serverRequests";
import { ApiRoutes } from "../util/ApiRoutes";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState<Player | null>(null);
    const [myStats, SetMyStats] = useState<PlayerStat[] | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

    const login = (token: string) => {
        localStorage.setItem("token", token);
        setToken(token);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const refreshPlayer = useCallback(
        () => {
            fetchWithAuth(ApiRoutes.GET_PLAYER_ME_INFO, HttpMethod.GET).then(async (res) => {
                if(res.ok) {
                    const _user: Player = await res.json();
                    setUser(_user);
                }
                else {
                    setUser(null);
                    logout();
                }
            });
        }, []);

    const refreshPlayerStats = useCallback(
        () => {
            fetchWithAuth(ApiRoutes.GET_PLAYER_STATS_ME, HttpMethod.GET).then(async (res) => {
                if(res.ok) {
                    const data = await res.json();
                    const results: PlayerStat[] = data.results;
                    results.sort( (a, b) => a.game_id - b.game_id );
                    SetMyStats(results);
                }
                else {
                    setUser(null);
                    logout();
                }
            });
        }, []);

    const doesPlayerHaveStatFor = useCallback(
        (game_id: number) => {
            if(myStats) {
                return myStats.filter( stat => stat.game_id === game_id ).length > 0;
            }
            return false;
        }, [myStats]);

    useEffect(() => {
        if(token) {
            refreshPlayer();
            refreshPlayerStats();
        }
    }, [refreshPlayer, refreshPlayerStats, token])

    return (
        <AuthContext.Provider value={{ user, token, login, logout, refreshPlayer, refreshPlayerStats, doesPlayerHaveStatFor }}>
            {children}
        </AuthContext.Provider>
    );
};