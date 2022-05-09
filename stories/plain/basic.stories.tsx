import React from "react";
import ClickAwayListener from "../../src/ClickAwayListener";
import { ActionLog, useActions } from "../components/Actions";
import Block from "../components/Block";
import { blue, blueDark } from "../components/colors";
import "./styles.css";

export default { title: "Stories/Basic" };

export const Scenario1 = () => {
  const { action } = useActions();
  return (
    <>
      <Block label="Outside" color={blue}>
        <ClickAwayListener
          onClickAway={action(`Clicked outside of ${blueDark} block`)}
        >
          <Block label="Inside" color={blueDark} animateClicks />
        </ClickAwayListener>
      </Block>
      <ActionLog />
    </>
  );
};
