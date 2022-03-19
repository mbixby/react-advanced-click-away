import React, { cloneElement, ReactElement, useContext, useRef } from "react";
import { ClickAwayContext } from "./context";
import useForkRef from "./utils/useForkRef";
import useObjectMemo from "./utils/useObjectMemo";

interface Props {
  /**
   * A single ref-accepting element
   */
  children: ReactElement;
}

/**
 * Establish a new root for click away listeners.
 *
 * Clicks outside of this overlay are ignored by `<ClickAwayListener>` elements inside it.
 */
const ClickAwayOverlay: React.FC<Props> = ({ children }) => {
  const ownRef = useRef<HTMLElement>(null);
  const combinedRef = useForkRef(
    // @ts-expect-error
    children.ref,
    ownRef
  );
  const clickAwayContext = useContext(ClickAwayContext);
  const newClickAwayContext = useObjectMemo({
    ...clickAwayContext,
    owner: ownRef,
  });
  return (
    <ClickAwayContext.Provider value={newClickAwayContext}>
      {cloneElement(children, { ref: combinedRef })}
    </ClickAwayContext.Provider>
  );
};

export default ClickAwayOverlay;
