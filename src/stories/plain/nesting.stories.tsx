import React, { CSSProperties, ReactNode } from "react";
import ReactDOM from "react-dom";
import ClickAwayListener from "../../ClickAwayListener";
import { useActions } from "../components/Actions";
import Block from "../components/Block";
import { blue, orange, pink, purple, red } from "../components/colors";

export default { title: "Stories/Nesting" };

const Portal: React.FC<{ children: ReactNode }> = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

export const Scenario1 = () => {
  const { action } = useActions();
  return (
    <>
      <Block label="Outside" color={blue}>
        <ClickAwayListener
          onClickAway={action(`Clicked outside of ${orange} block`)}
        >
          <Block label="First layer" color={orange} animateClicks>
            <ClickAwayListener
              onClickAway={action(`Clicked outside of ${red} block`)}
            >
              <Block label="Second layer" color={red} animateClicks />
            </ClickAwayListener>
          </Block>
        </ClickAwayListener>
      </Block>
    </>
  );
};

const outsideStyle: CSSProperties = { height: 230, width: 290 };

const firstLayerStyle: CSSProperties = {
  position: "absolute",
  left: 180,
  top: 40,
  height: 180,
  width: 250,
};

const secondLayerStyle: CSSProperties = {
  position: "absolute",
  left: 350,
  top: 70,
  height: 120,
  width: 120,
  zIndex: 2,
};

export const Scenario2 = () => {
  const { action } = useActions();
  return (
    <>
      <Block label="Outside" color={blue} style={outsideStyle}>
        <Portal>
          <ClickAwayListener
            onClickAway={action(`Clicked outside of ${purple} block`)}
          >
            <Block
              label="First layer"
              color={purple}
              animateClicks
              style={firstLayerStyle}
            >
              <Portal>
                <ClickAwayListener
                  onClickAway={action(`Clicked outside of ${pink} block`)}
                >
                  <Block
                    label="Second layer"
                    color={pink}
                    animateClicks
                    style={secondLayerStyle}
                  />
                </ClickAwayListener>
              </Portal>
            </Block>
          </ClickAwayListener>
        </Portal>
      </Block>
    </>
  );
};

Scenario2.parameters = {
  docs: { inlineStories: false, iframeHeight: 320 },
};
