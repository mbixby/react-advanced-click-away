import React, {
  cloneElement,
  forwardRef,
  ReactElement,
  useCallback,
} from "react";
import { eventNames } from "./utils/eventNames";
import useCombinedHandler from "./utils/useCombinedHandler";
import useForkRef from "./utils/useForkRef";

const fromPairs = <T extends unknown>(
  arr: [string, T][]
): { [key: string]: T } =>
  arr.reduce(
    (acc, val) => ((acc[val[0]] = val[1]), acc),
    {} as { [key: string]: T }
  );

export interface Props {
  /**
   * A single element that accepts event handlers
   */
  children?: ReactElement;
  /**
   * Stop mouse, touch, drag and keyboard events
   */
  all?: boolean;
  /**
   * Stop mouse events
   */
  mouse?: boolean;
  /**
   * Stop touch events
   */
  touch?: boolean;
  /**
   * Stop drag events
   */
  drag?: boolean;
  /**
   * Stop keyboard events
   */
  keyboard?: boolean;
  /**
   * Don't call `nativeEvent.stopImmediatePropagation()`
   */
  excludeNativeEvents?: boolean;
}

/**
 * Stops event bubbling to the parent element.
 *
 * Capture phase will stay unaffected.
 */
const StopPropagation = forwardRef<HTMLElement, Props>(
  (
    { children, all, mouse, touch, drag, keyboard, excludeNativeEvents },
    parentRef
  ) => {
    const hasSpecifier = [all, mouse, touch, drag, keyboard].some(
      (x) => typeof x === "boolean"
    );
    if (!hasSpecifier) {
      throw new Error("At least one <StopPropagation> prop must be a boolean.");
    }
    const combinedRef = useForkRef(
      // @ts-expect-error
      children?.ref,
      parentRef
    );

    const handleEvent = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();

        if (!excludeNativeEvents) {
          event.nativeEvent?.stopImmediatePropagation?.();
        }
      },
      [excludeNativeEvents]
    );

    const handlers = fromPairs(
      Object.keys(eventNames).map((kind) => {
        const group = eventNames[kind as keyof typeof eventNames].map(
          (eventName) => {
            // This hook will be always invoked the same amount of times and in the same
            // order.
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const combinedHandler = useCombinedHandler(
              children?.props[eventName],
              handleEvent
            );
            return [eventName, combinedHandler];
          }
        ) as [string, typeof handleEvent][];
        return [kind, fromPairs(group)];
      })
    );

    if (!children) {
      return null;
    }
    return cloneElement(children, {
      ref: combinedRef,
      ...(all || mouse ? handlers.mouse : null),
      ...(all || touch ? handlers.touch : null),
      ...(all || drag ? handlers.drag : null),
      ...(all || keyboard ? handlers.keyboard : null),
    });
  }
);

export default StopPropagation;
