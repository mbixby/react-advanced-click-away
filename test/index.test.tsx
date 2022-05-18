import {
  fireEvent,
  render as originalRender,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { forwardRef, useRef } from "react";
import ReactDOM from "react-dom";
import ClickAwayListener from "../src/ClickAwayListener";

const render = async (element: React.ReactElement) => {
  const result = await originalRender(element);
  // We have to defer the effect manually like `useEffect` would so we have to flush the
  // effect manually instead of relying on `act()`.
  // https://github.com/facebook/react/issues/20074
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 0));
  return result;
};

const delay = () => new Promise((resolve) => setTimeout(resolve, 10));

const Portal: React.FC<{
  children: React.ReactNode;
  stopEventPropagation?: boolean;
}> = ({ children, stopEventPropagation }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  if (!stopEventPropagation) {
    return ReactDOM.createPortal(children, document.body);
  }
  const handleEvent = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
  };
  return (
    <div
      ref={ref}
      onClick={handleEvent}
      onMouseUp={handleEvent}
      onMouseDown={handleEvent}
    >
      {children}
    </div>
  );
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("ClickAwayListener", () => {
  it("should render the children", async () => {
    const children = <span />;
    const { baseElement } = await render(
      <ClickAwayListener onClickAway={() => {}}>{children}</ClickAwayListener>
    );
    expect(baseElement.querySelectorAll("span").length).toEqual(1);
  });

  describe("prop: onClickAway", () => {
    it("should be called when clicking away", async () => {
      const handleClickAway = jest.fn();
      await render(
        <ClickAwayListener onClickAway={handleClickAway}>
          <span />
        </ClickAwayListener>
      );

      await userEvent.click(document.body);
      expect(handleClickAway).toHaveBeenCalledTimes(1);
      expect(handleClickAway.mock.calls[0].length).toEqual(1);
    });

    it("should not be called when clicking inside", async () => {
      const handleClickAway = jest.fn();
      const { container } = await render(
        <ClickAwayListener onClickAway={handleClickAway}>
          <span />
        </ClickAwayListener>
      );

      await userEvent.click(container.querySelector("span")!);
      expect(handleClickAway).toHaveBeenCalledTimes(0);
    });

    it("should be called when preventDefault is `true`", async () => {
      const handleClickAway = jest.fn();
      await render(
        <ClickAwayListener onClickAway={handleClickAway}>
          <span />
        </ClickAwayListener>
      );
      const preventDefault = (event: any) => event.preventDefault();
      document.body.addEventListener("click", preventDefault);

      await userEvent.click(document.body);
      expect(handleClickAway).toHaveBeenCalledTimes(1);

      document.body.removeEventListener("click", preventDefault);
    });

    it("should not be called when clicking inside a portaled element", async () => {
      const handleClickAway = jest.fn();
      const { getByText } = await render(
        <ClickAwayListener onClickAway={handleClickAway}>
          <div>
            <Portal>
              <span>Inside a portal</span>
            </Portal>
          </div>
        </ClickAwayListener>
      );

      await userEvent.click(getByText("Inside a portal"));
      expect(handleClickAway).toHaveBeenCalledTimes(0);
    });

    it("should be called when clicking inside a portaled element and `disableReactTree` is `true`", async () => {
      const handleClickAway = jest.fn();
      const { getByText } = await render(
        <ClickAwayListener onClickAway={handleClickAway} disableReactTree>
          <div>
            <Portal>
              <span>Inside a portal</span>
            </Portal>
          </div>
        </ClickAwayListener>
      );

      await userEvent.click(getByText("Inside a portal"));
      expect(handleClickAway).toHaveBeenCalledTimes(1);
    });

    it("should not be called even if the event propagation is stopped", async () => {
      const handleClickAway = jest.fn();
      const { getByText } = await render(
        <ClickAwayListener onClickAway={handleClickAway}>
          <div>
            <div
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              Outside a portal
            </div>
            <Portal>
              <span
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                Stop inside a portal
              </span>
            </Portal>
            <Portal>
              <span
                onClick={(event) => {
                  event.stopPropagation();
                  event.nativeEvent.stopImmediatePropagation();
                }}
              >
                Stop all inside a portal
              </span>
            </Portal>
          </div>
        </ClickAwayListener>
      );

      await userEvent.click(getByText("Outside a portal"));
      expect(handleClickAway).toHaveBeenCalledTimes(0);

      await userEvent.click(getByText("Stop all inside a portal"));
      expect(handleClickAway).toHaveBeenCalledTimes(0);

      await userEvent.click(getByText("Stop inside a portal"));
      expect(handleClickAway).toHaveBeenCalledTimes(0);
    });

    describe.each([["onClick", "onClickCapture"]])(
      "when %p mounted the listener",
      (eventListenerName) => {
        it("should not be called", async () => {
          function Test() {
            const [open, setOpen] = React.useState(false);

            return (
              <React.Fragment>
                <button
                  data-testid="trigger"
                  {...{ [eventListenerName]: () => setOpen(true) }}
                />
                {open &&
                  ReactDOM.createPortal(
                    <ClickAwayListener onClickAway={() => setOpen(false)}>
                      <div data-testid="child" />
                    </ClickAwayListener>,
                    // Needs to be an element between the react root we render into and
                    // the element where CAL attaches its native listener (now:
                    // `document`).
                    document.body
                  )}
              </React.Fragment>
            );
          }
          await render(<Test />);

          await userEvent.click(screen.getByTestId("trigger"));

          expect(screen.getByTestId("child")).not.toEqual(null);
        });
      }
    );

    it("should be called if an element is interleaved between mousedown and mouseup", async () => {
      function ancestorElements(element: HTMLElement) {
        const ancestors: HTMLElement[] = [];
        let ancestor: HTMLElement | null = element;
        while (ancestor !== null) {
          ancestors.unshift(ancestor);
          ancestor = ancestor.parentElement;
        }
        return ancestors;
      }

      function findNearestCommonAncestor(
        elementA: HTMLElement,
        elementB: HTMLElement
      ) {
        const ancestorsA = ancestorElements(elementA);
        const ancestorsB = ancestorElements(elementB);

        if (ancestorsA[0] !== ancestorsB[0]) {
          throw new Error("A and B share no common ancestor");
        }

        for (let index = 1; index < ancestorsA.length; index += 1) {
          if (ancestorsA[index] !== ancestorsB[index]) {
            return ancestorsA[index - 1];
          }
        }

        throw new Error(
          "Unreachable reached. This is a bug in findNearestCommonAncestor"
        );
      }

      const onClickAway = jest.fn();
      function ClickAwayListenerMouseDownPortal() {
        const [open, toggleOpen] = React.useReducer((flag) => !flag, false);

        return (
          <ClickAwayListener onClickAway={onClickAway}>
            <div data-testid="trigger" onMouseDown={toggleOpen}>
              {open &&
                // interleave an element during mousedown so that the following mouseup would not be targetted at the mousedown target.
                // This results in the click event being targetted at the nearest common ancestor.
                ReactDOM.createPortal(
                  <div data-testid="interleaved-element">Portaled Div</div>,
                  document.body
                )}
            </div>
          </ClickAwayListener>
        );
      }
      await render(<ClickAwayListenerMouseDownPortal />);
      const mouseDownTarget = screen.getByTestId("trigger");

      fireEvent.mouseDown(mouseDownTarget);
      const mouseUpTarget = screen.getByTestId("interleaved-element");
      // https://w3c.github.io/uievents/#events-mouseevent-event-order
      const clickTarget = findNearestCommonAncestor(
        mouseDownTarget,
        mouseUpTarget
      );
      fireEvent.mouseUp(mouseUpTarget);
      await userEvent.click(clickTarget);

      expect(onClickAway).toHaveBeenCalledTimes(1);
    });

    describe("when clicking outside on elements that stop event propagation", () => {
      it("should not be called if the element stops native event propagation", async () => {
        const handleClickAway = jest.fn();
        const restrictiveHandler = (event: any) =>
          event.stopImmediatePropagation();
        let button: HTMLButtonElement | null;
        const { getByText } = await render(
          <>
            <ClickAwayListener onClickAway={handleClickAway}>
              <div />
            </ClickAwayListener>
            <button
              ref={(element) => {
                button = element;
              }}
            >
              Outside
            </button>
          </>
        );
        button!.addEventListener("mouseup", restrictiveHandler);
        fireEvent.mouseUp(getByText("Outside"));
        // Note that fireEvent.click() would work fine.
        await Promise.resolve();
        expect(handleClickAway).toHaveBeenCalledTimes(0);
        button!.removeEventListener("mouseup", restrictiveHandler);
      });
    });

    describe("prop: mouseEvent", () => {
      it("should not call `props.onClickAway` when `props.mouseEvent` is `false`", async () => {
        const handleClickAway = jest.fn();
        await render(
          <ClickAwayListener onClickAway={handleClickAway} mouseEvent={false}>
            <span />
          </ClickAwayListener>
        );
        await userEvent.click(document.body);
        expect(handleClickAway).toHaveBeenCalledTimes(0);
      });

      it("should call `props.onClickAway` when the appropriate mouse event is triggered", async () => {
        const handleClickAway = jest.fn();
        await render(
          <ClickAwayListener
            onClickAway={handleClickAway}
            mouseEvent="mousedown"
          >
            <span />
          </ClickAwayListener>
        );
        fireEvent.mouseUp(document.body);
        expect(handleClickAway).toHaveBeenCalledTimes(0);
        fireEvent.mouseDown(document.body);
        expect(handleClickAway).toHaveBeenCalledTimes(1);
        expect(handleClickAway.mock.calls[0].length).toEqual(1);
      });
    });

    describe("prop: touchEvent", () => {
      it("should not call `props.onClickAway` when `props.touchEvent` is `false`", async () => {
        const handleClickAway = jest.fn();
        await render(
          <ClickAwayListener onClickAway={handleClickAway} touchEvent={false}>
            <span />
          </ClickAwayListener>
        );
        fireEvent.touchEnd(document.body);
        expect(handleClickAway).toHaveBeenCalledTimes(0);
      });

      it("should call `props.onClickAway` when the appropriate touch event is triggered", async () => {
        const handleClickAway = jest.fn();
        await render(
          <ClickAwayListener
            onClickAway={handleClickAway}
            touchEvent="touchstart"
          >
            <span />
          </ClickAwayListener>
        );
        fireEvent.touchEnd(document.body);
        expect(handleClickAway).toHaveBeenCalledTimes(0);
        fireEvent.touchStart(document.body);
        expect(handleClickAway).toHaveBeenCalledTimes(1);
        expect(handleClickAway.mock.calls[0].length).toEqual(1);
      });

      it("should ignore `touchend` when preceded by `touchmove` event", async () => {
        const handleClickAway = jest.fn();
        await render(
          <ClickAwayListener
            onClickAway={handleClickAway}
            touchEvent="touchend"
          >
            <span />
          </ClickAwayListener>
        );

        fireEvent.touchStart(document.body);
        fireEvent.touchMove(document.body);
        fireEvent.touchEnd(document.body);
        expect(handleClickAway).toHaveBeenCalledTimes(0);

        fireEvent.touchEnd(document.body);
        expect(handleClickAway).toHaveBeenCalledTimes(1);
        expect(handleClickAway.mock.calls[0].length).toEqual(1);
      });
    });

    it("should handle null child", async () => {
      const Child = forwardRef(() => null);
      const handleClickAway = jest.fn();
      await render(
        <ClickAwayListener onClickAway={handleClickAway}>
          <Child />
        </ClickAwayListener>
      );
      await userEvent.click(document.body);
      expect(handleClickAway).toHaveBeenCalledTimes(0);
    });

    describe.each([
      [false, "onClick"],
      [true, "onClick"],
    ])(`when 'disableReactTree=%s' then %s`, (disableReactTree, eventName) => {
      it("triggers onClickAway if an outside target is removed", async () => {
        if (!new Event("click").composedPath) {
          throw new Error();
        }

        const handleClickAway = jest.fn();
        function Test() {
          const [buttonShown, hideButton] = React.useReducer(() => false, true);

          return (
            <React.Fragment>
              {buttonShown && (
                <button {...{ [eventName]: hideButton }} type="button" />
              )}
              <ClickAwayListener
                onClickAway={handleClickAway}
                disableReactTree={disableReactTree}
              >
                <div />
              </ClickAwayListener>
            </React.Fragment>
          );
        }
        await render(<Test />);
        await userEvent.click(screen.getByRole("button"));

        expect(handleClickAway).toHaveBeenCalledTimes(1);
      });

      it("does not trigger onClickAway if an inside async target is removed", async () => {
        if (!new Event("click").composedPath) {
          return;
        }

        const handleClickAway = jest.fn();

        function Test() {
          const [buttonShown, hideButton] = React.useReducer(() => false, true);

          return (
            <ClickAwayListener
              onClickAway={handleClickAway}
              disableReactTree={disableReactTree}
            >
              <div>
                {buttonShown && (
                  <button {...{ [eventName]: hideButton }} type="button" />
                )}
              </div>
            </ClickAwayListener>
          );
        }
        await render(<Test />);
        await userEvent.click(screen.getByRole("button"));

        expect(handleClickAway).toHaveBeenCalledTimes(0);
      });
    });

    describe("nesting", () => {
      it("should call all prop.onClickAway handlers when clicking outside of both elements", async () => {
        const handleOuterClickAway = jest.fn();
        const handleInnerClickAway = jest.fn();
        await render(
          <>
            <ClickAwayListener onClickAway={handleOuterClickAway}>
              <div>
                <ClickAwayListener onClickAway={handleInnerClickAway}>
                  <div />
                </ClickAwayListener>
              </div>
            </ClickAwayListener>
            <button>Outside</button>
          </>
        );
        await userEvent.click(screen.getByRole("button"));
        expect(handleOuterClickAway).toHaveBeenCalledTimes(1);
        expect(handleInnerClickAway).toHaveBeenCalledTimes(1);
      });

      it("should not call outer prop.onClickAway when clicking in between", async () => {
        const handleOuterClickAway = jest.fn();
        const handleInnerClickAway = jest.fn();
        const handleWrapperClick = jest.fn();
        await render(
          <>
            <ClickAwayListener onClickAway={handleOuterClickAway}>
              <div onClick={handleWrapperClick}>
                <button>Between</button>
                <ClickAwayListener onClickAway={handleInnerClickAway}>
                  <div>
                    <button>Inside</button>
                  </div>
                </ClickAwayListener>
              </div>
            </ClickAwayListener>
            <button>Outside</button>
          </>
        );
        await userEvent.click(screen.getByText("Inside"));
        expect(handleOuterClickAway).toHaveBeenCalledTimes(0);
        expect(handleInnerClickAway).toHaveBeenCalledTimes(0);
        expect(handleWrapperClick).toHaveBeenCalledTimes(1);

        await userEvent.click(screen.getByText("Between"));
        expect(handleOuterClickAway).toHaveBeenCalledTimes(0);
        expect(handleInnerClickAway).toHaveBeenCalledTimes(1);
        expect(handleWrapperClick).toHaveBeenCalledTimes(2);

        await userEvent.click(screen.getByText("Outside"));
        expect(handleOuterClickAway).toHaveBeenCalledTimes(1);
        expect(handleInnerClickAway).toHaveBeenCalledTimes(2);
        expect(handleWrapperClick).toHaveBeenCalledTimes(2);
      });
    });
  });
});
