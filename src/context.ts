import React, { SyntheticEvent } from "react";

const noop = () => {};

export interface ClickAwayContextState {
  propagateEvent: (event: SyntheticEvent) => void;
  useCapture: boolean;
  owner: React.RefObject<HTMLElement>;
  level: number;
}

export const ClickAwayContext = React.createContext<ClickAwayContextState>({
  propagateEvent: noop,
  useCapture: false,
  owner: { current: null },
  level: -1,
});
