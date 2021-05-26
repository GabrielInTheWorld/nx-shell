import React, { ReactElement } from 'react';

import Icon from '../icon/Icon';
import Terminal from '../terminal/Terminal';

import './TerminalManager.scss';

interface IProps {
  onEnter?: (pid: number, command?: string, directory?: string) => void;
  onTab?: (pid: number, lastWord?: string, buffer?: string) => void;
}

interface IState {
  tabs: { [key: number]: { terminal: ReactElement; ref: React.RefObject<Terminal> } };
  activeTab: number;
}

export default class TerminalManager extends React.Component<IProps, IState> {
  private onEnter = (_pid: number, _buffer: string, _directory: string) => {};
  private onTab = (_pid: number, _lastWord: string, _buffer: string) => {};

  public constructor(props: IProps) {
    super(props);
    this.state = {
      tabs: {},
      activeTab: 0 // not initialized
    };
    this.init();
  }

  public componentDidMount(): void {
    this.addNewTab(1, (pid, terminal) => this.setActiveTab(pid, terminal));
  }

  public write(pid: number, buffer: string | Uint8Array, colors?: string): void {
    this.state.tabs[pid].ref.current?.write(buffer, colors);
  }

  public writeNewLine(pid: number): void {
    this.state.tabs[pid].ref.current?.writeNewLine();
  }

  public writeEmptyLine(pid: number): void {
    this.state.tabs[pid].ref.current?.writeEmptyLine();
  }

  public render() {
    return (
      <div className="terminal-manager">
        <div className="terminal-manager--header">
          <div>{this.getTabs()}</div>
          <div className="terminal-manager--add" onClick={() => this.addNewTab()}>
            <Icon size={16}>Plus</Icon>
          </div>
        </div>
        <div className="terminal-manager--container">{this.getTerminals()}</div>
      </div>
    );
  }

  private init(): void {
    const { onEnter, onTab } = this.props;
    if (onEnter) {
      this.onEnter = onEnter;
    }
    if (onTab) {
      this.onTab = onTab;
    }
  }

  private addNewTab(customPid?: number, onReady?: (pid: number, term: Terminal) => void): void {
    const pid = customPid || Math.round(Math.random() * 10000);
    const tabs = this.state.tabs;
    const ref = React.createRef<Terminal>();
    tabs[pid] = {
      terminal: (
        <Terminal
          ref={ref}
          pid={pid}
          onReady={(pid, terminal) => (onReady ? onReady(pid, terminal) : {})}
          onEnter={(pid, buffer, directory) => this.onEnter(pid, buffer, directory)}
          onTab={(pid, lastWord, buffer) => this.onTab(pid, lastWord, buffer)}
        />
      ),
      ref: ref as any
    };
    this.setState({ tabs });
  }

  private getTabs(): any {
    const tabKeys = Object.keys(this.state.tabs);
    const { activeTab } = this.state;
    return tabKeys.map((pid: string | number) => {
      pid = parseInt(pid as string, 10);
      return (
        <div key={pid} className={`terminal-manager--tab tab-${pid} ${activeTab === pid ? 'active' : ''}`}>
          <div onClick={() => this.setActiveTab(pid as number)}>
            <Icon size={16}>Home</Icon>
            <span className="tab-name">Node-Shell</span>
          </div>
          {tabKeys.length > 1 ? (
            <Icon size={16} action={() => this.removeTerminal(pid as number)}>
              Close
            </Icon>
          ) : (
            ''
          )}
        </div>
      );
    });
  }

  private getTerminals(): ReactElement[] {
    const tabs = Object.values(this.state.tabs);
    return tabs.map((tab, index) => <React.Fragment key={index}>{tab.terminal}</React.Fragment>);
  }

  private setActiveTab(pid: number, ref?: Terminal): void {
    const { tabs } = this.state;
    if (tabs[this.state.activeTab]?.ref) {
      tabs[this.state.activeTab].ref.current?.dispose();
    }
    this.setState({ activeTab: pid });
    if (ref) {
      ref.reactivate();
    } else if (tabs[pid].ref) {
      tabs[pid].ref.current?.reactivate();
    }
  }

  private removeTerminal(pid: number): void {
    const tabs = this.state.tabs;
    delete tabs[pid];
    this.setState({ tabs });
  }
}
