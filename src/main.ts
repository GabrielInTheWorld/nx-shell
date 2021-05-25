import { app, BrowserWindow } from "electron";

const isDev = process.env.NODE_ENV === "development";

const createWindow = (): void => {
	let win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true,
		},
	});
	win
		.loadURL(
			isDev ? "http://localhost:9000" : `file://${app.getAppPath()}/index.html`
		)
		.then(() => win.webContents.openDevTools());
};

app.on("ready", createWindow);
