import { useCallback } from "react";

/**
 * Combine two event handlers (e.g. onClick callbacks)
 */
const useCombinedHandler = <TEvent>(
  callback1: ((event: TEvent) => void) | undefined,
  callback2: ((event: TEvent) => void) | undefined
): ((event: TEvent) => void) =>
  useCallback(
    (event: TEvent) => {
      callback1?.(event);
      callback2?.(event);
    },
    [callback1, callback2]
  );

export default useCombinedHandler;
