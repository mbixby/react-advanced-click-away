import React, { CSSProperties, ReactNode } from "react";
import ReactDOM from "react-dom";
import ClickAwayListener from "../../src/ClickAwayListener";
import Layer from "../../src/Layer";
import StopPropagation from "../../src/StopPropagation";
import { useActions } from "../components/Actions";
import Block from "../components/Block";
import {
  blue,
  blueTransparent,
  orange,
  pink,
  purple,
} from "../components/colors";

export default {
  title: "Stories/Propagation",
  decorators: [
    (Story) => (
      <Layer root>
        <div>
          <Story />
        </div>
      </Layer>
    ),
  ],
};

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

const outsideStyle: CSSProperties = {
  height: 140,
  width: 450,
};

const purpleBlockStyle: CSSProperties = {
  position: "absolute",
  left: 180,
  top: 40,
  height: (outsideStyle.height as number) - 50,
  width: 190,
};

const pinkBlockStyle: CSSProperties = {
  position: "absolute",
  left: 320,
  top: 60,
  height: (outsideStyle.height as number) - 90,
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
              label="Block"
              color={purple}
              animateClicks
              style={purpleBlockStyle}
            >
              <Portal>
                <StopPropagation all>
                  <ClickAwayListener
                    onClickAway={action(`Clicked outside of ${pink} block`)}
                  >
                    <Block
                      label="Portaled block"
                      color={pink}
                      animateClicks
                      style={pinkBlockStyle}
                    />
                  </ClickAwayListener>
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
  docs: { inlineStories: false, iframeHeight: 230 },
};

export const Scenario3 = () => {
  const { action } = useActions();
  return (
    <>
      <ClickAwayListener
        onClickAway={action(`Clicked outside of ${orange} block`)}
      >
        <Block
          label="Underneath"
          color={orange}
          animateClicks
          invertArrowColor
        />
      </ClickAwayListener>

      <Layer>
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
                invertArrowColor
              />
            </ClickAwayListener>
          </Block>
        </StopPropagation>
      </Layer>
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
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={(event) => {
            event.stopPropagation();
          }}
          style={buttonStyle4}
        >
          Button calling <code>stopPropagation</code>
        </button>

        <button
          onMouseUp={(event) => {
            event.stopPropagation();
            event.nativeEvent.stopImmediatePropagation();
          }}
          style={buttonStyle4}
        >
          Button calling <code>stopImmediatePropagation</code>
        </button>
      </div>

      <Block label="Outside" color={blue}>
        <ClickAwayListener
          onClickAway={action(`Clicked outside of ${orange} block`)}
        >
          <Block label="Block" color={orange} animateClicks />
        </ClickAwayListener>
      </Block>
    </>
  );
};
