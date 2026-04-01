import { useState } from 'react';
import './App.css'
import Navbar from './components/Navbar'
import { LoginScreen } from './pages/LoginScreen'
import { PlayerInfoScreen } from './pages/PlayerInfoScreen';

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

function App() {

    const [pageId, setPageId] = useState(0);
    const [loggedIn, setLoggedIn] = useState(false);
    
    let navButtons: string[] = [
      getPageId(Page.Players, loggedIn),
      getPageId(Page.Games, loggedIn),
      getPageId(Page.Account, loggedIn)
    ];

    return <>
        <Navbar navButtons={navButtons} setPageId={setPageId}></Navbar>
        {pageId === Page.Account && <LoginScreen></LoginScreen>}
        {pageId === Page.Games && <label>Hello!</label>}
        {pageId === Page.Players && <PlayerInfoScreen/>}
    </>
}

export default App
