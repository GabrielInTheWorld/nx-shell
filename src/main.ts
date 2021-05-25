import { app, BrowserWindow } from "electron";
import isDev from "electron-is-dev"; // New Import

const createWindow = (): void => {
	let win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true,
		},
	});
	console.log("Is dev mode: ", isDev);
	win
		.loadURL(
			isDev ? "http://localhost:9000" : `file://${app.getAppPath()}/index.html`
		)
		.then(() => win.webContents.openDevTools());
};

app.on("ready", createWindow);
