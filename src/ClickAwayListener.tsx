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
import { LayerContext } from "./layerContext";
import { useForkRef } from "./utils/useForkRef";
import useRefCallback from "./utils/useRefCallback";

// Set to true to log click away actions.
const debug = false;
// Name of a child prop to label debug messages.
const debugLabelProp = "label";

const compact = <T extends unknown>(array: T[]): T[] =>
  array.filter((x) => !!x);

const log = (label: string | undefined, ...args: any[]) => {
  if (debug) {
    // eslint-disable-next-line no-console
    console.log(
      compact(["ClickAwayListener", label && ` (${label})`, ":"]).join(""),
      ...args
    );
  }
};

function clickedRootScrollbar(event: MouseEvent, doc: Document) {
  return (
    doc.documentElement.clientWidth < event.clientX ||
    doc.documentElement.clientHeight < event.clientY
  );
}

const mouseEventMap = {
  click: "onClickCapture" as "onClickCapture",
  mouseup: "onMouseUpCapture" as "onMouseUpCapture",
  mousedown: "onMouseDownCapture" as "onMouseDownCapture",
};

const touchEventMap = {
  touchstart: "onTouchStartCapture" as "onTouchStartCapture",
  touchend: "onTouchEndCapture" as "onTouchEndCapture",
};

const eventPhaseLabel: { [key in number]: string } = {
  0: "no phase",
  1: "capture phase",
  2: "at target",
  3: "bubble phase",
};

const getEventLabel = (event: Event | SyntheticEvent) =>
  `${event.type} event (${eventPhaseLabel[event.eventPhase]})`;

type ClickAwayMouseEvent = keyof typeof mouseEventMap;
type ClickAwayTouchEvent = keyof typeof touchEventMap;
type ReactEventHandlers =
  | typeof mouseEventMap[ClickAwayMouseEvent]
  | typeof touchEventMap[ClickAwayTouchEvent];
type HandleEvent<T extends Event> = (event: T) => void;

export interface Props {
  /**
   * Handler called on click away.
   */
  onClickAway: (event: MouseEvent | TouchEvent) => void;
  /**
   * This must be a ref-accepting child.
   */
  children: ReactElement;
  /**
   * Clickaway event to listen to.
   * @default 'mousedown'
   */
  mouseEvent?: ClickAwayMouseEvent | false;
  /**
   * Clickaway event to listen to.
   * @default 'touchend'
   */
  touchEvent?: ClickAwayTouchEvent | false;
  /**
   * If `true`, the React tree is ignored and only the DOM tree is considered. This means
   * that elements inside React portal will be considered to be outside of the
   * `<ClickAwayListener>`.
   * @default false
   */
  disableReactTree?: boolean;
  /**
   * If true, clicking the window scrollbars will not trigger the `onClickAway()` handler.
   */
  ignoreScrollbars?: boolean;
  /**
   * Root element, `document` by default. Clicking outside of this element will not
   * trigger the `onClickAway()` handler.
   */
  layer?: HTMLElement;
}

/**
 * Listen for click events that occur somewhere in the document, outside of the element
 * itself. For instance, if you need to hide a menu when people click anywhere else on
 * your page.
 */
const ClickAwayListener: React.FC<Props> = ({
  children: child,
  disableReactTree = false,
  mouseEvent = "mousedown",
  onClickAway,
  touchEvent = "touchstart",
  ignoreScrollbars = false,
  layer: layerProp,
}) => {
  const movedRef = useRef(false);
  const nodeRef = useRef<Element>(null);
  const activatedRef = useRef(false);
  const didHandleSyntheticEvent = useRef(false);
  const shouldAttemptClickaway = useRef(false);
  const lastNativeEvent = useRef<MouseEvent | TouchEvent>();
  const mouseEventHandler = mouseEvent ? mouseEventMap[mouseEvent] : mouseEvent;
  const touchEventHandler = touchEvent ? touchEventMap[touchEvent] : touchEvent;
  const label = child?.props?.[debugLabelProp]; // for debugging
  const ownerDocument = nodeRef.current?.ownerDocument ?? document;
  const context = useContext(LayerContext);
  const { isDisabled } = context;
  const layerElement =
    layerProp ?? context.ownLayer.current ?? ownerDocument.documentElement;

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
    child.ref,
    nodeRef
  );

  const attemptClickAway = useRefCallback(() => {
    const event = lastNativeEvent.current!;
    log(label, `attempting click away`, { event, isDisabled, nodeRef });

    const insideReactTree = didHandleSyntheticEvent.current;
    const shouldAttempt = shouldAttemptClickaway.current;
    didHandleSyntheticEvent.current = false;
    shouldAttemptClickaway.current = false;

    if (isDisabled || !shouldAttempt) {
      return;
    }

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

    const insideDOM =
      !layerElement.contains(
        // @ts-expect-error
        event.target
      ) ||
      nodeRef.current.contains(
        // @ts-expect-error
        event.target
      );

    const isClickAway = !insideDOM && (disableReactTree || !insideReactTree);

    if (isClickAway) {
      const reason = "the target is not DOM tree or React tree descendant";
      log(label, `onClickAway() is called because ${reason}`);
    } else {
      const reasons = compact([
        insideDOM && "a DOM tree descendant",
        !disableReactTree && insideReactTree && "a React tree descendant",
      ]);
      const reason = `the event target is ${reasons.join(" and ")}`;
      log(label, `onClickAway() is not called because ${reason}`);
    }

    if (isClickAway) {
      onClickAway(event);
    }
  }, [onClickAway, disableReactTree, ownerDocument, layerElement, isDisabled]);

  const handleNativeEvent = useRefCallback(
    (event: MouseEvent | TouchEvent) => {
      log(label, `handling ${getEventLabel(event)} from document`, {
        event,
        isDisabled,
        nodeRef,
      });
      if (isDisabled) {
        return;
      }
      shouldAttemptClickaway.current = true;
      lastNativeEvent.current = event;
      // This capture phase click away handler will be called before the synthetic event
      // handler. We need to wait for the synthetic event to check whether the event comes
      // from inside the React tree.
      setTimeout(() => {
        attemptClickAway();
      });
    },
    [isDisabled, attemptClickAway]
  );

  // Keep track of mouse/touch events that bubbled up through the portal.
  const createHandleSynthetic =
    (handlerName: string) => (event: SyntheticEvent) => {
      log(label, `handling ${getEventLabel(event)} from React descendant`, {
        isDisabled,
        event,
      });
      if (isDisabled) {
        return;
      }
      didHandleSyntheticEvent.current = true;
      const childrenPropsHandler = child?.props?.[handlerName];
      childrenPropsHandler?.(event);
      attemptClickAway();
    };

  const childrenProps: { ref: Ref<Element> } & Pick<
    DOMAttributes<Element>,
    ReactEventHandlers
  > = { ref: handleRef };

  if (touchEventHandler !== false) {
    childrenProps[touchEventHandler] = createHandleSynthetic(touchEventHandler);
  }

  useEffect(() => {
    if (touchEvent !== false) {
      const handleTouchMove = () => {
        movedRef.current = true;
      };
      const handleCapturePhase = handleNativeEvent as HandleEvent<Event>;
      const handleBubblePhase = attemptClickAway as HandleEvent<Event>;
      document.addEventListener(touchEvent, handleCapturePhase, true);
      document.addEventListener("touchmove", handleTouchMove, true);
      document.addEventListener(touchEvent, handleBubblePhase);
      return () => {
        document.removeEventListener(touchEvent, handleCapturePhase, true);
        document.removeEventListener("touchmove", handleTouchMove, true);
        document.addEventListener(touchEvent, handleBubblePhase);
      };
    }
  }, [handleNativeEvent, attemptClickAway, touchEvent]);

  if (mouseEventHandler !== false) {
    childrenProps[mouseEventHandler] = createHandleSynthetic(mouseEventHandler);
  }

  useEffect(() => {
    if (mouseEvent) {
      const handleCapturePhase = handleNativeEvent as HandleEvent<Event>;
      const handleBubblePhase = attemptClickAway as HandleEvent<Event>;
      document.addEventListener(mouseEvent, handleCapturePhase, true);
      document.addEventListener(mouseEvent, handleBubblePhase);
      return () => {
        document.removeEventListener(mouseEvent, handleCapturePhase, true);
        document.addEventListener(mouseEvent, handleBubblePhase);
      };
    }
  }, [handleNativeEvent, attemptClickAway, mouseEvent]);

  return cloneElement(child, childrenProps);
};

export default ClickAwayListener;
