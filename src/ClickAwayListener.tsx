import React, {
  cloneElement,
  DOMAttributes,
  ReactElement,
  Ref,
  SyntheticEvent,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useForkRef } from "./utils/useForkRef";
import useObjectMemo from "./utils/useObjectMemo";
import useRefCallback from "./utils/useRefCallback";
import { ClickAwayContext } from "./context";

// Used in development. Set to true to log click away actions.
const debug = false;

const compact = <T extends unknown>(array: T[]): T[] =>
  array.filter((x) => !!x);

const log = (level: number, ...args: any[]) => {
  if (debug) {
    // eslint-disable-next-line no-console
    console.log(`ClickAwayListener (level ${level}): `, ...args);
  }
};

function clickedRootScrollbar(event: MouseEvent, doc: Document) {
  return (
    doc.documentElement.clientWidth < event.clientX ||
    doc.documentElement.clientHeight < event.clientY
  );
}

type ClickAwayMouseEventHandler = "onClick" | "onMouseDown" | "onMouseUp";
type ClickAwayTouchEventHandler = "onTouchStart" | "onTouchEnd";
type HandleClickAway<T extends Event> = (event: T) => void;

function mapEventPropToEvent(
  eventProp: ClickAwayMouseEventHandler | ClickAwayTouchEventHandler
): "click" | "mousedown" | "mouseup" | "touchstart" | "touchend" {
  return eventProp.substring(2).toLowerCase() as any;
}

export interface Props {
  /**
   * Handler called on click away
   */
  onClickAway: (event: MouseEvent | TouchEvent) => void;
  /**
   * This must be a ref-accepting child
   */
  children: ReactElement;
  /**
   * Clickaway event to listen to
   * @default 'onMouseUp'
   */
  mouseEvent?: ClickAwayMouseEventHandler | false;
  /**
   * Clickaway event to listen to
   * @default 'onTouchEnd'
   */
  touchEvent?: ClickAwayTouchEventHandler | false;
  /**
   * If `true`, the React tree is ignored and only the DOM tree is considered. This means that elements inside React portal will be considered to be outside of the `<ClickAwayListener>`.
   * @default false
   */
  disableReactTree?: boolean;
  /**
   * Typically, ClickAwayListener requires mouse events (mouseup by default) to be
   * propagated all the way up to the document. If an element on a page stops propagation
   * of the event, clicking on that element will not trigger the onClickAway() handler.
   *
   * Event bubbling is useful here to determine whether the event comes from inside the
   * DOM or React tree and therefore it is the default behaviour.
   *
   * When this behaviour is not desired, this option can be set to true and the capture
   * phase of the clickaway event will trigger the onClickAway() handler instead.
   */
  useCapture?: boolean;
  /**
   * If true, clicking the window scrollbars will not trigger the `onClickAway()` handler.
   */
  ignoreScrollbars?: boolean;
  /**
   * Root element, `document` by default. Clicking outside of this element will not
   * trigger the `onClickAway()` handler.
   */
  owner?: HTMLElement;
}

/**
 * Listen for click events that occur somewhere in the document, outside of the element
 * itself. For instance, if you need to hide a menu when people click anywhere else on
 * your page.
 */
const ClickAwayListener: React.FC<Props> = ({
  children,
  disableReactTree = false,
  mouseEvent = "onMouseUp",
  onClickAway,
  touchEvent = "onTouchEnd",
  useCapture = false,
  ignoreScrollbars = false,
  owner: ownerProp,
}) => {
  const movedRef = useRef(false);
  const nodeRef = useRef<Element>(null);
  const activatedRef = useRef(false);
  const syntheticEventRef = useRef(false);
  const context = useContext(ClickAwayContext);
  const level = context.level + 1;
  const ownerDocument = nodeRef.current?.ownerDocument ?? document;
  const ownerElement =
    ownerProp ?? context.owner.current ?? ownerDocument.documentElement;
  const targetElement = ownerProp ?? context.owner.current ?? ownerDocument;

  useEffect(() => {
    // Ensure that this component is not "activated" synchronously.
    // https://github.com/facebook/react/issues/20074
    setTimeout(() => {
      activatedRef.current = true;
    }, 0);
    return () => {
      activatedRef.current = false;
    };
  }, []);

  const handleRef = useForkRef(
    // @ts-expect-error
    children.ref,
    nodeRef
  );

  // The handler doesn't take event.defaultPrevented into account:
  //
  // event.preventDefault() is meant to stop default behaviors like
  // clicking a checkbox to check it, hitting a button to submit a form,
  // and hitting left arrow to move the cursor in a text input etc.
  // Only special HTML elements have these default behaviors.
  const handleClickAway = useRefCallback(
    (event: MouseEvent | TouchEvent) => {
      log(level, `handling ${event.type} event from document`, event);

      // Given developers can stop the propagation of the synthetic event,
      // we can only be confident with a positive value.
      const insideReactTree = syntheticEventRef.current;
      syntheticEventRef.current = false;

      const didClickScrollbar =
        !ignoreScrollbars &&
        "clientX" in event &&
        clickedRootScrollbar(event, ownerDocument);

      // 1. IE11 support, which trigger the handleClickAway even after the unbind
      // 2. The child might render null.
      // 3. Behave like a blur listener.
      if (!activatedRef.current || !nodeRef.current || didClickScrollbar) {
        return;
      }

      // Do not act if user performed touchmove
      if (movedRef.current) {
        movedRef.current = false;
        return;
      }

      let insideDOM;

      // If not enough, can use https://github.com/DieterHolvoet/event-propagation-path/blob/master/propagationPath.js
      if (event.composedPath) {
        insideDOM = event.composedPath().indexOf(nodeRef.current) > -1;
      } else {
        insideDOM =
          !ownerElement.contains(
            // @ts-expect-error
            event.target
          ) ||
          nodeRef.current.contains(
            // @ts-expect-error
            event.target
          );
      }

      const isClickAway = !insideDOM && (disableReactTree || !insideReactTree);

      if (isClickAway) {
        const reason = "the target is not DOM tree or React tree descendant";
        log(level, `onClickAway() is called because ${reason}`);
      } else {
        const reasons = compact([
          insideDOM && "DOM tree descendant",
          !disableReactTree && insideReactTree && "React tree descendant",
        ]);
        const reason = `event target is ${reasons.join(" and ")}`;
        log(level, `onClickAway() is not called because ${reason}`);
      }

      if (isClickAway) {
        onClickAway(event);
      }
    },
    [onClickAway, disableReactTree, level, ownerDocument, ownerElement]
  );

  if (context.useCapture && !useCapture) {
    // eslint-disable-next-line
    console.error(
      "Nesting of ClickAwayListener components is not supported if the parent has the useCapture prop set to true."
    );
  }

  const propagateEvent = useRefCallback(
    (event: SyntheticEvent) => {
      if (mouseEvent && event.type === mapEventPropToEvent(mouseEvent)) {
        syntheticEventRef.current = true;
      }
      log(level, `received event ${event.type} from downstream`);
      context.propagateEvent(event);
    },
    [context, mouseEvent, level]
  );

  // Keep track of mouse/touch events that bubbled up through the portal.
  const createHandleSynthetic =
    (handlerName: string) => (event: SyntheticEvent) => {
      log(level, `handling ${event.type} event from React descendant`, event);

      syntheticEventRef.current = true;

      const childrenPropsHandler = children.props[handlerName];
      childrenPropsHandler?.(event);

      // Inform parent ClickAwayListeners about events coming from inside the React
      // tree. We'll propagate the event solely to the ClickAwayListener elements
      // via React context.
      context.propagateEvent(event);
    };

  const childrenProps: { ref: Ref<Element> } & Pick<
    DOMAttributes<Element>,
    ClickAwayMouseEventHandler | ClickAwayTouchEventHandler
  > = { ref: handleRef };

  if (touchEvent !== false) {
    childrenProps[touchEvent] = createHandleSynthetic(touchEvent);
  }

  useEffect(() => {
    if (touchEvent !== false) {
      const mappedTouchEvent = mapEventPropToEvent(touchEvent);
      const handleTouchMove = () => {
        movedRef.current = true;
      };
      targetElement.addEventListener(
        mappedTouchEvent,
        handleClickAway as HandleClickAway<Event>,
        useCapture
      );
      targetElement.addEventListener("touchmove", handleTouchMove, useCapture);
      return () => {
        targetElement.removeEventListener(
          mappedTouchEvent,
          handleClickAway as HandleClickAway<Event>
        );
        targetElement.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, [handleClickAway, touchEvent, useCapture, targetElement]);

  if (mouseEvent !== false) {
    childrenProps[mouseEvent] = createHandleSynthetic(mouseEvent);
  }

  useEffect(() => {
    if (mouseEvent) {
      const mappedMouseEvent = mapEventPropToEvent(mouseEvent);
      targetElement.addEventListener(
        mappedMouseEvent,
        handleClickAway as HandleClickAway<Event>,
        useCapture
      );
      return () => {
        targetElement.removeEventListener(
          mappedMouseEvent,
          handleClickAway as HandleClickAway<Event>
        );
      };
    }
  }, [handleClickAway, mouseEvent, useCapture, targetElement]);

  const newContextValue = useObjectMemo({
    ...context,
    propagateEvent,
    useCapture,
    level,
  });

  return (
    <ClickAwayContext.Provider value={newContextValue}>
      {cloneElement(children, childrenProps)}
    </ClickAwayContext.Provider>
  );
};

export default ClickAwayListener;
