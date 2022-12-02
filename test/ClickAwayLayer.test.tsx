import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import ClickAwayLayer from "../src/ClickAwayLayer";
import ClickAwayListener from "../src/ClickAwayListener";

const waitForEffects = () => new Promise((resolve) => setTimeout(resolve));

it("should disable click away listeners underneath the layer", async () => {
  const onRedClickAway = jest.fn();
  const onGreenClickAway = jest.fn();

  await render(
    <ClickAwayLayer root>
      <div>
        <div>Outside red</div>

        <ClickAwayListener onClickAway={onRedClickAway}>
          <div>Red</div>
        </ClickAwayListener>

        <ClickAwayLayer>
          <div>
            <div>Outside green</div>

            <ClickAwayListener onClickAway={onGreenClickAway}>
              <div>Green</div>
            </ClickAwayListener>
          </div>
        </ClickAwayLayer>
      </div>
    </ClickAwayLayer>
  );

  await userEvent.click(screen.getByText("Green"));
  await waitForEffects();
  expect(onGreenClickAway).not.toHaveBeenCalled();

  await userEvent.click(screen.getByText("Outside green"));
  await waitForEffects();
  expect(onGreenClickAway).toHaveBeenCalled();

  await userEvent.click(screen.getByText("Outside red"));
  await waitForEffects();
  expect(onRedClickAway).not.toHaveBeenCalled();

  // Clicks outside of the layer do not affect the inner ClickAwayListener
  expect(onGreenClickAway).toHaveBeenCalledTimes(1);
});
