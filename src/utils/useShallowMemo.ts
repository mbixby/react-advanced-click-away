import { useRef } from "react";
import shallowEqual from "shallowequal";

/**
 * Memoize an object using shallow equality.
 */
function useShallowMemo<TValue>(value: TValue): TValue {
  const ref = useRef<TValue>();
  if (!ref.current || !shallowEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
}

export default useShallowMemo;
