// src/context/AuthContext.tsx
import { createContext, useState, useEffect, useCallback } from "react";
import type {Player} from "../util/Models"
import { fetchWithAuth, HttpMethod } from "../util/serverRequests";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState<Player | null>(null);
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
            fetchWithAuth('players/me', HttpMethod.GET).then(async (res) => {
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

    useEffect(() => {
        if(token) {
            refreshPlayer();
        }
    }, [refreshPlayer, token])

    return (
        <AuthContext.Provider value={{ user, token, login, logout, refreshPlayer }}>
            {children}
        </AuthContext.Provider>
    );
};