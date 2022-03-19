import { useRef } from "react";
import isEqual from "fast-deep-equal";

/**
 * Memoize a result using deep equality.
 *
 * Adapted from https://github.com/apollographql/react-apollo/blob/master/packages/hooks
 * src/utils/useDeepMemo.ts
 */
function useDeepMemo<TKey, TValue>(memoFn: () => TValue, key: TKey): TValue {
  const ref = useRef<{ key: TKey; value: TValue }>();

  if (!ref.current || !isEqual(key, ref.current.key)) {
    ref.current = { key, value: memoFn() };
  }

  return ref.current.value;
}

export default useDeepMemo;
