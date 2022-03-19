import React, {
  cloneElement,
  ReactElement,
  useCallback,
  useContext,
} from "react";
import { ClickAwayContext } from "./context";
import { clickAwayEventNames, eventNames } from "./utils/eventNames";
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
  children: ReactElement;
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
  /**
   * Set to true to propagate click away events
   */
  excludeClickaway?: boolean;
}

const StopPropagation = React.forwardRef<HTMLElement, Props>(
  (
    {
      children,
      all,
      mouse,
      touch,
      drag,
      keyboard,
      excludeNativeEvents,
      excludeClickaway,
    },
    parentRef
  ) => {
    const hasSpecifier = [all, mouse, touch, drag, keyboard].some(
      (x) => typeof x === "boolean"
    );
    if (!hasSpecifier) {
      throw new Error("At least one <StopPropagation> prop must be a boolean.");
    }
    const clickAwayContext = useContext(ClickAwayContext);
    const combinedRef = useForkRef(
      // @ts-expect-error
      children.ref,
      parentRef
    );

    const handleEvent = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();

        if (!excludeNativeEvents) {
          event.nativeEvent.stopImmediatePropagation();
        }
      },
      [excludeNativeEvents]
    );

    const handleClickAwayEvent = useCallback(
      (event: React.MouseEvent) => {
        handleEvent(event);
        if (excludeClickaway) {
          // See comments for ClickAwayContext. This event will propagate to
          // document node and thus will be handled by <ClickAwayListener>. However
          // before that point, we'll have informed the parent that the event is
          // coming from inside its React tree descendant (this component).
          clickAwayContext?.propagateEvent(event);
        }
      },
      [clickAwayContext, excludeClickaway, handleEvent]
    );

    const handlers = fromPairs(
      Object.keys(eventNames).map((kind) => {
        const group = eventNames[kind as keyof typeof eventNames].map(
          (eventName) => {
            const ownHandler = clickAwayEventNames.includes(eventName)
              ? handleClickAwayEvent
              : handleEvent;
            // This hook will be always invoked the same amount of times and in the same
            // order.
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const combinedHandler = useCombinedHandler(
              children.props[eventName],
              ownHandler
            );
            return [eventName, combinedHandler];
          }
        ) as [string, typeof handleEvent][];
        return [kind, fromPairs(group)];
      })
    );

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
