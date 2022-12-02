import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { FC, MouseEventHandler } from "react";
import useCombinedHandler from "../../src/utils/useCombinedHandler";

const handleClickA = jest.fn() as jest.MockedFunction<MouseEventHandler>;
const handleClickB = jest.fn() as jest.MockedFunction<MouseEventHandler>;

const Component: FC<{
  onClick: MouseEventHandler;
}> = (props) => {
  const handleClickCombined = useCombinedHandler(handleClickA, props.onClick);
  return <div onClick={handleClickCombined}>Click me</div>;
};

it("executes both handlers", async () => {
  render(<Component onClick={handleClickB} />);
  await userEvent.click(screen.getByText("Click me"));
  expect(handleClickA).toHaveBeenCalled();
  const event = handleClickA.mock.calls[0][0];
  expect(event.type).toBe("click");
  expect(handleClickB).toHaveBeenCalledWith(event);
});
