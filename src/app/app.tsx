import React from 'react';
import './app.scss'; // New import!!
import ElectronRemoteService from './core/services/electron-remote.service';

import TerminalManager from './components/terminal-manager/TerminalManager';

class App extends React.Component {
  private electron: ElectronRemoteService = ElectronRemoteService.getInstance();

  public componentDidMount() {
    this.checkElectron();
  }

  private checkElectron(): void {
    if (this.electron.isElectron) {
      console.log('Running in Electron');
      console.log('ipcRenderer', this.electron.ipcRenderer);
    } else {
      console.log('Running in web');
    }
  }

  public render() {
    return (
      <div className="app">
        <TerminalManager />
      </div>
    );
  }
}

export default App;
