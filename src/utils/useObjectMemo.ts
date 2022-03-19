import useDeepMemo from "./useDeepMemo";

/**
 * Memoize an object using deep equality.
 *
 * Does deep comparison on every rerender. Unlike useDeepMemo this compares
 * the object directly instead of comparing dependencies.
 *
 * This is useful for short objects that are as cheap to compare as their
 * dependencies.
 */
function useObjectMemo<TValue>(value: TValue): TValue {
  return useDeepMemo(() => value, [value]);
}

export default useObjectMemo;
