import React, { CSSProperties, ReactNode } from "react";
import ReactDOM from "react-dom";
import ClickAwayListener from "../../ClickAwayListener";
import ClickAwayOverlay from "../../ClickAwayOverlay";
import StopPropagation from "../../StopPropagation";
import { useActions } from "../components/Actions";
import Block from "../components/Block";
import {
  blue,
  blueTransparent,
  orange,
  pink,
  purple,
  red,
} from "../components/colors";

export default { title: "Stories/Propagation" };

const Portal: React.FC<{ children: ReactNode }> = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

const buttonStyle1 = {
  marginTop: 12,
  marginBottom: 24,
  marginLeft: 12,
};

export const Scenario1 = () => {
  const { action } = useActions();
  return (
    <>
      <Block label="Outside" color={blue}>
        <ClickAwayListener
          onClickAway={action(`Clicked outside of ${orange} block`)}
        >
          <Block label="Inside" color={orange} animateClicks>
            <button
              onClick={(event) => {
                event.stopPropagation();
                event.nativeEvent.stopImmediatePropagation();
              }}
              style={buttonStyle1}
            >
              Button
            </button>
          </Block>
        </ClickAwayListener>

        <button
          onClick={(event) => {
            event.stopPropagation();
            event.nativeEvent.stopImmediatePropagation();
          }}
          style={buttonStyle1}
        >
          Button
        </button>
      </Block>
    </>
  );
};

const outsideStyle: CSSProperties = { height: 120, width: 580 };

const firstLayerStyle: CSSProperties = {
  position: "absolute",
  left: 180,
  top: 40,
  height: (outsideStyle.height as number) - 50,
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
              label="Block"
              color={purple}
              animateClicks
              style={firstLayerStyle}
            >
              <Portal>
                <StopPropagation all>
                  <Block label="Portaled block" color={pink} animateClicks />
                </StopPropagation>
              </Portal>
            </Block>
          </ClickAwayListener>
        </Portal>
      </Block>
    </>
  );
};

Scenario2.parameters = {
  docs: { inlineStories: false, iframeHeight: 280 },
};

export const Scenario3 = () => {
  const { action } = useActions();
  return (
    <>
      <ClickAwayListener
        onClickAway={action(`Clicked outside of ${orange} block`)}
      >
        <Block label="Underneath" color={orange} animateClicks />
      </ClickAwayListener>

      <ClickAwayOverlay>
        <StopPropagation all>
          <Block label="Overlay" color={blueTransparent} style={{ left: -80 }}>
            <ClickAwayListener
              onClickAway={action(`Clicked outside of ${purple} block`)}
            >
              <Block
                label="Inside"
                color={purple}
                animateClicks
                style={{ marginLeft: 120 }}
              />
            </ClickAwayListener>
          </Block>
        </StopPropagation>
      </ClickAwayOverlay>
    </>
  );
};

const buttonStyle4 = {
  marginTop: 12,
  marginRight: 24,
};

export const Scenario4 = () => {
  const { action } = useActions();
  return (
    <>
      <Block label="Outside" color={blue}>
        <ClickAwayListener
          onClickAway={action(`Clicked outside of ${orange} block`)}
        >
          <Block label="Inside" color={orange} animateClicks />
        </ClickAwayListener>

        <ClickAwayListener
          useCapture
          onClickAway={action(`Clicked outside of ${red} block`)}
        >
          <Block label="Inside" color={red} animateClicks />
        </ClickAwayListener>
      </Block>

      <div style={{ marginTop: 24 }}>
        <button
          onClick={(event) => {
            event.stopPropagation();
          }}
          style={buttonStyle4}
        >
          Slightly restrictive button
        </button>

        <button
          onMouseUp={(event) => {
            event.stopPropagation();
            event.nativeEvent.stopImmediatePropagation();
          }}
          style={buttonStyle4}
        >
          Very restrictive button
        </button>
      </div>
    </>
  );
};
