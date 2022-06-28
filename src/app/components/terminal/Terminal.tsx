import React from 'react';
import * as XTerm from 'xterm';
import 'xterm/css/xterm.css';

import { FitAddon } from 'xterm-addon-fit';

import FontFaceLoader from '../../utils/font-face-loader';
import Colors from '../../utils/colors';
import './Terminal.scss';

/**
 * Floating point number that represents the width of every character written in terminals in pixel.
 */
const CHARACTER_WIDTH = 9;
/**
 * An integer that represents the height of every row in terminals in pixel.
 */
const ROW_HEIGHT = 19;

const sleep = (ms: number) => {
  const startTime = new Date().getTime();
  while (new Date().getTime() < startTime + ms) {
    // sleep!
  }
};

interface IProps {
  onEnter?: (pid: number, buffer: string, directory: string) => void;
  onTab?: (pid: number, lastWord: string, buffer: string) => void;
  onReady?: (pid: number, ref: Terminal) => void;
  pid: number;
}

interface IState {
  visible: boolean;
}

export default class Terminal extends React.Component<IProps, IState> {
  private terminal: XTerm.Terminal = new XTerm.Terminal(this.getOptions());
  private fitAddon = new FitAddon();

  private onEnter = (_pid: number, _buffer: string, _directory: string) => {};
  private onTab = (_pid: number, _lastWord: string, _buffer: string) => {};
  private onReady = (_pid: number, _ref: Terminal) => {};

  private chunk = '';

  private column = 0;

  private directory = __dirname;

  private parentElement: HTMLDivElement | null = null;
  // private parentElementRef = React.createRef<HTMLDivElement>();
  private parentElementRef = (element: HTMLDivElement) => {
    console.log('element:', element);
    this.parentElement = element;
  };

  public constructor(props: IProps) {
    super(props);
    this.state = {
      visible: false
    };
  }

  public async componentDidMount() {
    this.terminal.loadAddon(this.fitAddon);
    this.terminal.loadAddon(new FontFaceLoader());
    console.log('parentElement', this.parentElement);
    // this.terminal.open(this.parentElement as HTMLElement);
    // this.fitAddon.fit();
    await (this.terminal as any).loadWebfontAndOpen(this.parentElement);
    console.log('core', (this.terminal as any)._core);
    // .finally(() =>
    //   console.log('dimensions:', this.fitAddon.proposeDimensions(), this.fitAddon.fit(), this.makeReady())
    // );
    // while (!this.fitAddon.proposeDimensions()) {
    //   console.log('dimensions:', this.fitAddon.proposeDimensions());
    //   sleep(100);
    //   this.fitAddon.fit();
    // }
    this.terminal.onKey(event => this.onKeyEvent(event.key, event.domEvent)); // = (event: {key: string, domEvent: KeyboardEvent}) => this.onKeyEvent(event.key, event.domEvent)
    this.terminal.onData(data => this.onData(data));
    window.onresize = () => {
      this.fitAddon.fit();
      // const { cols, rows } = this.getDimensions();
      // this.terminal.resize(cols, rows);
    };
    this.write(`Terminal: ${this.props.pid}`, Colors.FgYellow);
    this.writeEmptyLine();
    this.init();
    this.onReady(this.props.pid, this);
  }

  public write(buffer: string | Uint8Array, colors: string = ''): void {
    if (buffer instanceof Uint8Array) {
      buffer = String.fromCharCode.apply(null, Array.from(buffer));
    }
    this.terminal.write(`${colors}${buffer}${Colors.Reset}`);
  }

  public writeNewLine() {
    this.write(`NX ${this.directory}> `);
  }

  public writeEmptyLine(): void {
    this.write('\n\r');
  }

  public setDirectory(directory: string): void {
    this.directory = directory;
  }

  public dispose(): void {
    this.setState({ visible: false });
  }

  public reactivate(): void {
    this.setState({ visible: true });
  }

  public render() {
    const { pid } = this.props;
    const { visible } = this.state;
    // this.fitAddon.fit();
    return (
      <div
        className="terminal"
        id={'terminal_' + pid}
        ref={this.parentElementRef}
        style={{ display: visible ? 'block' : 'none' }}
      ></div>
    );
  }

  private makeReady(): void {
    // console.log('dimensions:', this.fitAddon.proposeDimensions());
    // this.fitAddon.fit();
    this.terminal.onKey(event => this.onKeyEvent(event.key, event.domEvent)); // = (event: {key: string, domEvent: KeyboardEvent}) => this.onKeyEvent(event.key, event.domEvent)
    this.terminal.onData(data => this.onData(data));
    window.onresize = () => {
      this.fitAddon.fit();
      // const { cols, rows } = this.getDimensions();
      // this.terminal.resize(cols, rows);
    };
    this.write(`Terminal: ${this.props.pid}`, Colors.FgYellow);
    this.writeEmptyLine();
    this.init();
    this.onReady(this.props.pid, this);
  }

  private init(): void {
    const { onEnter, onTab, onReady } = this.props;
    if (onEnter) {
      this.onEnter = onEnter;
    }
    if (onTab) {
      this.onTab = onTab;
    }
    if (onReady) {
      this.onReady = onReady;
    }
    this.writeNewLine();
    this.terminal.focus();
  }

  private onKeyEvent(key: string, domEvent: KeyboardEvent): void {
    console.log('onKeyEvent', domEvent);
    if (domEvent.key === 'Enter') {
      this.handleEnterKey();
    } else if (domEvent.key === 'Tab') {
      this.handleTabKey();
    } else if (domEvent.key === 'Backspace') {
      this.handleBackspaceKey(domEvent);
    } else if (domEvent.key === 'ArrowUp') {
      this.handleUpCommand();
    } else if (domEvent.key === 'ArrowDown') {
      this.handleDownCommand();
    } else if (domEvent.key === 'ArrayRight') {
      this.handleRightCommand(domEvent);
    } else if (domEvent.key === 'ArrayLeft') {
      this.handleLeftCommand(domEvent);
    } else if (/\w*\W*/g.test(key)) {
      this.handleKey(key);
    } else {
      console.log('UNDEFINED key:', key, domEvent);
      domEvent.preventDefault();
    }
  }

  private handleEnterKey() {
    this.terminal.write('\n\r');
    this.onEnter(this.props.pid, this.chunk, this.directory);
    this.chunk = '';
    this.column = 0;
  }

  private handleBackspaceKey(domEvent: KeyboardEvent) {
    if (this.column === 0) {
      return;
    }
    if (domEvent.ctrlKey) {
      this.deleteCompleteWord();
    } else {
      this.deleteOneCharacter();
    }
  }

  private deleteCompleteWord(): void {
    while (this.chunk[this.chunk.length - 1] !== ' ' && this.chunk[this.chunk.length - 1] !== '/' && this.column > 0) {
      this.deleteOneCharacter();
    }
    if (this.column > 0) {
      this.deleteOneCharacter();
    }
  }

  private deleteOneCharacter(): void {
    this.terminal.write('\b \b');
    this.chunk = this.chunk.slice(0, -1);
    --this.column;
  }

  private handleTabKey() {
    const words = this.chunk;
    this.onTab(this.props.pid, words.split(' ').reverse()[0], this.chunk);
  }

  private handleKey(key: string): void {
    console.log('handleKey:', this.terminal);
    this.terminal.write(key);
    ++this.column;
    this.chunk += key;
  }

  private handleUpCommand(): void {}

  private handleDownCommand(): void {}

  private handleLeftCommand(domEvent: KeyboardEvent): void {
    domEvent.preventDefault();
  }

  private handleRightCommand(domEvent: KeyboardEvent): void {
    domEvent.preventDefault();
  }

  private onData = (data: string) => {
    console.log('data:', data);
  };

  private getDimensions(): { cols: number; rows: number } {
    console.log('getDimensions', window.innerWidth, window.innerHeight);
    const cols = Math.floor((window.innerWidth - 12) / CHARACTER_WIDTH);
    const rows = Math.floor((window.innerHeight - 46) / ROW_HEIGHT);
    console.log('getDimension:cols-rows', cols, rows);
    return { cols, rows };
  }

  private getOptions(): XTerm.ITerminalOptions {
    return {
      convertEol: true,
      lineHeight: 1,
      fontSize: 16,
      fontFamily: 'Cascadia Code',
      cols: this.getDimensions().cols,
      rows: this.getDimensions().rows
    };
  }
}
