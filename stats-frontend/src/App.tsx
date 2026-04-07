import { useState } from 'react';
import './App.css'
import Navbar from './components/Navbar'
import { AccountScreen } from './pages/AccountScreen'
import { PlayerInfoScreen } from './pages/PlayerInfoScreen';
import { AuthProvider } from './context/AuthContext';
import { PlayerStatsAllPage } from './pages/PlayerStatsAllPage';

const Page = {
  MyStats: 0,
  Games: 1,
  Account: 2
}

function getPageId(page: number, isLoggedIn: boolean): string {
  switch(page) {
    case Page.MyStats: return 'My Stats';
    case Page.Games: return 'Games';
    case Page.Account: return isLoggedIn ? 'Account' : 'Sign In';
  }
  return '';
}

function isLoggedIn(): boolean {
    return !! localStorage.getItem('token');
}

function App() {

    const [pageId, setPageId] = useState(0);

    const _isLoggedIn = isLoggedIn();
    
    const navButtons: string[] = [
      getPageId(Page.MyStats, _isLoggedIn),
      getPageId(Page.Games, _isLoggedIn),
      getPageId(Page.Account, _isLoggedIn)
    ];

    return (
      <AuthProvider>
          <Navbar navButtons={navButtons} setPageId={setPageId}></Navbar>
          {pageId === Page.Account && <AccountScreen/>}
          {pageId === Page.Games && <PlayerStatsAllPage/>}
          {pageId === Page.MyStats && <PlayerInfoScreen/>}
      </AuthProvider>
    );
}

export default App
