import React from 'react';

import './Icon.scss';

interface IProps {
  color?: string;
  size?: number;
  action?: () => void;
  children: string;
}

export default class Icon extends React.Component<IProps> {
  public render() {
    const { children, color, size, action } = this.props;
    const icon = this.loadIcon(children);
    const hasAction = !!action;
    const click = action ? action : () => {};
    return (
      <span
        className={`icon ${hasAction ? 'has-action' : ''}`}
        style={{ width: (size || 24) + 8, height: (size || 24) + 8 }}
        onClick={() => click()}
      >
        <svg style={{ fill: color ? color : 'white', width: size, height: size }} viewBox="0 0 24 24">
          <path d={icon} />
        </svg>
      </span>
    );
  }

  private loadIcon(iconString: string): string {
    const mdiFont = require('@mdi/js');
    const icon = mdiFont[`mdi${iconString}`];
    return icon;
  }
}
