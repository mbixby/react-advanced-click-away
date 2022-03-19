import React from "react";
import ClickAwayListener from "../../ClickAwayListener";
import { ActionLog, useActions } from "../components/Actions";
import Block from "../components/Block";
import { blue, orange } from "../components/colors";
import "./styles.css";

export default {
  title: "Stories/Basic",
  parameters: {
    docs: { inlineStories: false, iframeHeight: 200 },
  },
};

export const Scenario1 = () => {
  const { action } = useActions();
  return (
    <>
      <Block label="Outside" color={blue}>
        <ClickAwayListener
          onClickAway={action(`Clicked outside of ${orange} block`)}
        >
          <Block label="Inside" color={orange} animateClicks />
        </ClickAwayListener>
      </Block>
      <ActionLog />
    </>
  );
};
