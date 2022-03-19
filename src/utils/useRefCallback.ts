import { DependencyList, useCallback, useLayoutEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Arguments<T> = T extends (...args: infer T) => any ? T : never;

const warn = (warning: any) => () => {
  throw new Error(warning);
};

/**
 * Adapted from https://reactjs.org/docs/hooks-faq.html#how-to-read-an-
 * often-changing-value-from-usecallback.
 *
 * See also https://github.com/facebook/react/issues/16154 and `useEventCallback` in
 * https://github.com/formium/formik/blob/31405ab/packages/formik/src/Formik.tsx
 * and https://mobile.twitter.com/diegohaz/status/1324168516061245441
 */
function useRefCallback<T extends (...args: any) => any>(
  callback: T,
  dependencies: DependencyList
): T {
  const ref = useRef<T>(
    // @ts-expect-error
    warn("Cannot call an event handler while rendering.")
  );

  useLayoutEffect(() => {
    ref.current = callback;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...dependencies]);

  const frozenCallback = useCallback(
    (...args: Arguments<T>): ReturnType<T> => {
      const fn = ref.current;
      // @ts-ignore
      return fn(...args);
    },
    [ref]
  );

  return frozenCallback as T;
}

export default useRefCallback;
