import { RefCallback, useMemo } from "react";

const noop = () => {};

/**
 * Mutable alternative of React.Ref from the official React types
 */
export type MutableRef<T> =
  | { bivarianceHack(instance: T | null): void }["bivarianceHack"]
  | React.MutableRefObject<T>
  | null;

/**
 * Set React.ref value whether it's a function or object ref
 */
export function setReactRef<T>(ref: MutableRef<T>, value: T): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref && typeof ref === "object") {
    // eslint-disable-next-line no-param-reassign
    ref.current = value;
  }
}

/**
 * Adapted from material-ui/blob/master/packages/material-ui/src/utils/useForkRef.js
 */
export function useForkRef<T>(
  ref1: MutableRef<T> | undefined,
  ref2: MutableRef<T> | undefined
): RefCallback<T> {
  return useMemo(() => {
    if (ref1 == null && ref2 == null) {
      return noop;
    }
    return (refValue) => {
      if (ref1) {
        setReactRef(ref1, refValue);
      }
      if (ref2) {
        setReactRef(ref2, refValue);
      }
    };
  }, [ref1, ref2]);
}

export default useForkRef;
