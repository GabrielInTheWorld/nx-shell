import { ipcRenderer, webFrame } from "electron";
import * as remote from "@electron/remote";
import * as childProcess from "child_process";
import * as fs from "fs";

export default class ElectronRemoteService {
	private static instance: ElectronRemoteService;

	private _ipcRenderer: typeof ipcRenderer | undefined;
	private webFrame: typeof webFrame | undefined;
	private remote: typeof remote | undefined;
	private childProcess: typeof childProcess | undefined;
	private fs: typeof fs | undefined;

	public get isElectron(): boolean {
		return !!(window && window.process && window.process.type);
	}

	public get ipcRenderer(): typeof ipcRenderer | undefined {
		return this._ipcRenderer;
	}

	private constructor() {
		// Conditional imports
		if (this.isElectron) {
			this._ipcRenderer = window.require("electron").ipcRenderer;
			this.webFrame = window.require("electron").webFrame;

			// If you want to use remote object in renderer process, please set enableRemoteModule to true in main.ts
			this.remote = window.require("@electron/remote");
			// console.log('remote - globalShortcut', this.remote.globalShortcut);

			this.childProcess = window.require("child_process");
			this.fs = window.require("fs");
		}
	}

	public static getInstance(): ElectronRemoteService {
		if (!this.instance) {
			this.instance = new ElectronRemoteService();
		}
		return this.instance;
	}
}
