import './App.css'
import Navbar from './components/Navbar'
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PlayerStatsAllPage } from './pages/PlayerStatsAllPage';
import { PlayerInfoPage } from './pages/PlayerInfoPage';
import { GameSearchPage } from './pages/GameSearchPage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { WebPageRoutes } from './util/WebPages';
import type { JSX } from 'react';
import { useAuth } from './context/useAuth';
import { EditPopupProvider } from './context/EditPopupContext';
import { AccountPage } from './pages/AccountPage';


function App() {
    return (
      <ContextBuilder>
        
        <BrowserRouter>
          <Navbar></Navbar>
          <Routes>
            <Route path="/" element={<Navigate to={WebPageRoutes.ACCOUNT} replace />} />
            <Route path={WebPageRoutes.ACCOUNT} element={<AccountPage/>} />
            <Route path={WebPageRoutes.MY_STATS} element={
              <ProtectedRoute>
                <PlayerInfoPage/>
              </ProtectedRoute>
            } />
            <Route path={WebPageRoutes.ALL_STATS} element={<PlayerStatsAllPage/>} />
            <Route path={WebPageRoutes.GAMES} element={<GameSearchPage/>} />
          </Routes>
        </BrowserRouter>

      </ContextBuilder>
          
            
    );
}

function ContextBuilder({ children }: { children: JSX.Element }) {
  return <>
    <AuthProvider>
      <ToastProvider>
        <EditPopupProvider>
          {children}
        </EditPopupProvider>
      </ToastProvider>
    </AuthProvider>
  </>
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
