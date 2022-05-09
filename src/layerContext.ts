import React, { Dispatch, SetStateAction } from "react";

export interface LayerState {
  /**
   * Layer to be inherited by descendant ClickAwayListeners. Parent document if `null`.
   */
  ownLayer: React.RefObject<HTMLElement>;
  /**
   * True if click away listeners on this layer are disabled
   */
  isDisabled: boolean;
  /**
   * Disable the layer
   */
  setDisabled: Dispatch<SetStateAction<boolean>>;
  /**
   * True for the root layer
   */
  hasRoot: boolean;
}

export const LayerContext = React.createContext<LayerState>({
  ownLayer: { current: null },
  isDisabled: false,
  setDisabled: () => {},
  hasRoot: false,
});
