import FontFaceObserver from 'fontfaceobserver';
import { ITerminalAddon, Terminal } from 'xterm';

export default class FontFaceLoader implements ITerminalAddon {
  private terminalReference: Terminal | null = null;

  public activate(terminal: Terminal): any {
    this.terminalReference = terminal;
    const fontFamily = terminal.getOption('fontFamily');
    (terminal as any).loadWebfontAndOpen = (parent: HTMLElement) => {
      const regularFont = new FontFaceObserver(fontFamily).load();
      return regularFont.then(
        () => {
          terminal.open(parent);
          return this;
        },
        () => {
          terminal.setOption('fontFamily', 'Cascadia Mono');
          terminal.open(parent);
          return this;
        }
      );
    };
  }

  public dispose(): void {
    delete (this.terminalReference as any)?.loadWebfontAndOpen;
  }
}
