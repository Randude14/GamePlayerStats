import { useState } from 'react';
import './App.css'
import Navbar from './components/Navbar'
import { AccountScreen } from './pages/AccountScreen'
import { PlayerInfoScreen } from './pages/PlayerInfoScreen';
import { AuthProvider } from './context/AuthContext';
import { PlayerStatsAllPage } from './pages/PlayerStatsAllPage';
import { GameSearchScreen } from './pages/GameSearchScreen';
import { useAuth } from './context/useAuth';

const Page = {
  AllStats: 0,
  MyStats: 1,
  Games: 2,
  Account: 3
}

function getPageId(page: number, isLoggedIn: boolean): string {
  switch(page) {
    case Page.AllStats: return 'All Stats';
    case Page.MyStats: return 'My Stats';
    case Page.Games: return 'Games';
    case Page.Account: return isLoggedIn ? 'Account' : 'Sign In';
  }
  return '';
}

function App() {

    const [pageId, setPageId] = useState(0);

    const isLoggedIn: boolean = !!localStorage.getItem('token');
    
    const navButtons: string[] = [
      getPageId(Page.AllStats, isLoggedIn),
      getPageId(Page.MyStats, isLoggedIn),
      getPageId(Page.Games, isLoggedIn),
      getPageId(Page.Account, isLoggedIn)
    ];

    return (
      <AuthProvider>
          <Navbar navButtons={navButtons} setPageId={setPageId}></Navbar>
          {pageId === Page.AllStats && <PlayerStatsAllPage/>}
          {pageId === Page.Account && <AccountScreen/>}
          {pageId === Page.Games && <GameSearchScreen/>}
          {pageId === Page.MyStats && <PlayerInfoScreen/>}
      </AuthProvider>
    );
}

export default App
