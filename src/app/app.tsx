import React from "react";
import "./app.scss"; // New import!!
import ElectronRemoteService from "./core/services/electron-remote.service";

// const App = () => {
// 	return (
// 		<div className="app">
// 			<h2>He</h2>
// 			<h1>I'm React running in Electron App!!</h1>
// 		</div>
// 	);
// };
class App extends React.Component {
	private electron: ElectronRemoteService = ElectronRemoteService.getInstance();

	public componentDidMount() {
		this.checkElectron();
	}

	private checkElectron(): void {
		if (this.electron.isElectron) {
			console.log("Running in Electron");
			console.log("ipcRenderer", this.electron.ipcRenderer);
		} else {
			console.log("Running in web");
		}
	}

	public render() {
		return (
			<div className="app">
				<h2>He</h2>
				<h1>I'm using React running in an Electron App!!</h1>
			</div>
		);
	}
}

export default App;
