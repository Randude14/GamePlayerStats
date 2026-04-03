import { useState } from 'react';
import './App.css'
import Navbar from './components/Navbar'
import { AccountScreen } from './pages/AccountScreen'
import { PlayerInfoScreen } from './pages/PlayerInfoScreen';
import { AuthProvider } from './context/AuthContext';
import { PlayerStatsAllPage } from './pages/PlayerStatsAllPage';

enum Page {
  Players,
  Games,
  Account
}

function getPageId(page: Page, isLoggedIn: boolean): string {
  switch(page) {
    case Page.Players: return 'Players';
    case Page.Games: return 'Games';
    case Page.Account: return isLoggedIn ? 'Account' : 'Sign In';
  }
}

function isLoggedIn(): boolean {
    return !! localStorage.getItem('token');
}

function App() {

    const [pageId, setPageId] = useState(0);

    const _isLoggedIn = isLoggedIn();
    
    let navButtons: string[] = [
      getPageId(Page.Players, _isLoggedIn),
      getPageId(Page.Games, _isLoggedIn),
      getPageId(Page.Account, _isLoggedIn)
    ];

    return (
      <AuthProvider>
          <Navbar navButtons={navButtons} setPageId={setPageId}></Navbar>
          {pageId === Page.Account && <AccountScreen/>}
          {pageId === Page.Games && <PlayerStatsAllPage/>}
          {pageId === Page.Players && <PlayerInfoScreen/>}
      </AuthProvider>
    );
}

export default App
