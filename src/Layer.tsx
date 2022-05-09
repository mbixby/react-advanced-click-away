import React, {
  cloneElement,
  forwardRef,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { LayerContext } from "./layerContext";
import useForkRef from "./utils/useForkRef";

interface Props {
  /**
   * A single ref-accepting element.
   */
  children?: ReactElement;
  /**
   * Set to true for the root layer.
   */
  root?: boolean;
}

/**
 * Establish a new layer for click away listeners.
 *
 * `<ClickAwayListener>` elements outside of the topmost layer will be disabled until the
 * layer is unmounted.
 */
const Layer = forwardRef<HTMLDivElement, Props>(
  ({ children, root = false }, parentRef) => {
    const parentLayer = useContext(LayerContext);
    if (
      !parentLayer?.hasRoot &&
      !root &&
      process.env.NODE_ENV !== "production"
    ) {
      console.warn("Wrap the app in <Layer root> to use <Layer> components.");
    }
    const [isDisabled, setDisabled] = useState<boolean>(false);
    const setParentDisabled = parentLayer?.setDisabled;

    const ownRef = useRef<HTMLElement>(null);
    const partialRef = useForkRef(ownRef, parentRef);
    const combinedRef = useForkRef(
      // @ts-expect-error
      children.ref,
      partialRef
    );

    // Disable the parent layer on mount
    useEffect(() => {
      if (root) {
        return;
      }
      setParentDisabled?.(true);
      return () => setParentDisabled?.(false);
    }, [root, setParentDisabled, ownRef]);

    const updatedContext = {
      ...parentLayer,
      ownLayer: ownRef,
      hasRoot: root || parentLayer.hasRoot,
      isDisabled,
      setDisabled,
    };
    return (
      <LayerContext.Provider value={updatedContext}>
        {root || !children
          ? children
          : cloneElement(children, { ref: combinedRef })}
      </LayerContext.Provider>
    );
  }
);

export default Layer;
