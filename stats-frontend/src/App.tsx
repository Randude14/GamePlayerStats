import './App.css'
import Navbar from './components/Navbar'
import { AccountScreen } from './pages/AccountScreen'
import { PlayerInfoScreen } from './pages/PlayerInfoScreen';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PlayerStatsAllPage } from './pages/PlayerStatsAllPage';
import { GameSearchScreen } from './pages/GameSearchScreen';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { WebPageRoutes } from './util/WebPages';
import type { JSX } from 'react';
import { useAuth } from './context/useAuth';

function App() {
    return (
      <AuthProvider>
        <ToastProvider>
          
            <BrowserRouter>
              <Navbar></Navbar>
              <Routes>
                <Route path="/" element={<Navigate to={WebPageRoutes.ACCOUNT} replace />} />
                <Route path={WebPageRoutes.ACCOUNT} element={<AccountScreen/>} />
                <Route path={WebPageRoutes.MY_STATS} element={
                  <ProtectedRoute>
                    <PlayerInfoScreen/>
                  </ProtectedRoute>
                } />
                <Route path={WebPageRoutes.ALL_STATS} element={<PlayerStatsAllPage/>} />
                <Route path={WebPageRoutes.GAMES} element={<GameSearchScreen/>} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
      </AuthProvider>
    );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  const isLoggedIn = !!token;

    if (!isLoggedIn) {
      return <Navigate to={WebPageRoutes.ACCOUNT} />;
    }

  return children;
}

export default App
