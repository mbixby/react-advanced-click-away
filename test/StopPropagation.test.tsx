import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { Dispatch, SetStateAction, useState } from "react";
import { act } from "react-dom/test-utils";
import StopPropagation from "../src/StopPropagation";

type StopPropagationProps = React.ComponentProps<typeof StopPropagation>;

it("should disable click away listeners underneath the layer", async () => {
  const onClick = jest.fn();
  const onTouchStart = jest.fn();
  const onDragStart = jest.fn();
  const onKeyDown = jest.fn();
  let setProps: Dispatch<SetStateAction<StopPropagationProps>>;

  const Component = () => {
    const store = useState<StopPropagationProps>({ all: true });
    const props = store[0];
    setProps = store[1];

    return (
      <div
        onClick={onClick}
        onTouchStart={onTouchStart}
        onDragStart={onDragStart}
        onKeyDown={onKeyDown}
      >
        <StopPropagation {...props}>
          <div>Click me</div>
        </StopPropagation>
      </div>
    );
  };

  await render(<Component />);

  await userEvent.click(screen.getByText("Click me"));
  expect(onClick).not.toHaveBeenCalled();

  jest.resetAllMocks();
  act(() => setProps!({ all: false }));

  await userEvent.click(screen.getByText("Click me"));
  expect(onClick).toHaveBeenCalled();
  await fireEvent.touchStart(screen.getByText("Click me"));
  expect(onTouchStart).toHaveBeenCalled();
  await fireEvent.touchStart(screen.getByText("Click me"));
  expect(onTouchStart).toHaveBeenCalled();
  await fireEvent.dragStart(screen.getByText("Click me"));
  expect(onDragStart).toHaveBeenCalled();
  await fireEvent.keyDown(screen.getByText("Click me"));
  expect(onDragStart).toHaveBeenCalled();

  jest.resetAllMocks();
  act(() => setProps!({ mouse: true }));

  await userEvent.click(screen.getByText("Click me"));
  expect(onClick).not.toHaveBeenCalled();
  await fireEvent.touchStart(screen.getByText("Click me"));
  expect(onTouchStart).toHaveBeenCalled();

  jest.resetAllMocks();
  act(() => setProps!({ touch: true }));

  await fireEvent.touchStart(screen.getByText("Click me"));
  expect(onTouchStart).not.toHaveBeenCalled();

  jest.resetAllMocks();
  act(() => setProps!({ drag: true }));

  await fireEvent.dragStart(screen.getByText("Click me"));
  expect(onDragStart).not.toHaveBeenCalled();

  jest.resetAllMocks();
  act(() => setProps!({ keyboard: true }));

  await fireEvent.keyDown(screen.getByText("Click me"));
  expect(onKeyDown).not.toHaveBeenCalled();
});
