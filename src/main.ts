import { app, BrowserWindow, screen } from 'electron';

// initialize remote module
require('@electron/remote/main').initialize();

const isDev = process.env.NODE_ENV === 'development';

const createWindow = (): void => {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  let win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      allowRunningInsecureContent: isDev ? true : false,
      enableRemoteModule: true
    }
  });

  win.loadURL(isDev ? 'http://localhost:9000' : `file://${__dirname}/index.html`).then(() => {
    if (isDev) {
      win.webContents.openDevTools();
    }
  });
};

app.on('ready', createWindow);
