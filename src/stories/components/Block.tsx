import chroma from "chroma-js";
import classNames from "classnames";
import React, { forwardRef, useEffect, useState } from "react";
import {
  MdArrowBack,
  MdArrowDownward,
  MdArrowForward,
  MdArrowUpward,
} from "react-icons/md";
import { useActions } from "./Actions";
import "./Block.css";

const Block = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    color: string;
    label: string;
    animateClicks?: boolean;
    invertArrowColor?: boolean;
  }
>(
  (
    { children, color, label, animateClicks, invertArrowColor, ...rest }: any,
    ref
  ) => {
    const { actionLog } = useActions();
    const [insideClickCount, setInsideClickCount] = useState(0);
    const outsideClickCount =
      actionLog[`Clicked outside of ${color} block`]?.count ?? 0;
    const [alertText, setAlertText] = useState<string>();

    const [isAnimating, animate] = useState({
      inside: false,
      outside: false,
      text: false,
    });

    const startAnimation = async (type: "inside" | "outside" | "text") => {
      animate((prev) => ({ ...prev, [type]: false }));
      await Promise.resolve();
      animate((prev) => ({ ...prev, [type]: true }));
    };
    const stopAnimation = async (type: "inside" | "outside" | "text") => {
      animate((prev) => ({ ...prev, [type]: false }));
    };

    useEffect(() => {
      if (insideClickCount) {
        setAlertText("Clicked inside");
        startAnimation("text");
        startAnimation("inside");
      }
    }, [insideClickCount]);

    useEffect(() => {
      if (outsideClickCount) {
        setAlertText("Clicked outside");
        startAnimation("text");
        startAnimation("outside");
      }
    }, [outsideClickCount]);

    return (
      <div
        {...rest}
        className="block"
        onMouseDown={(event) => {
          if (animateClicks) {
            setInsideClickCount((prev) => prev + 1);
          }
          rest.onMouseDown?.(event);
          event.stopPropagation();
        }}
        ref={ref}
        style={{
          background: color,
          color: chroma.contrast(color, "white") > 2 ? "white" : "black",
          ...rest.style,
        }}
      >
        {["inside" as "inside", "outside" as "outside"].map((direction) => {
          const className = classNames(
            "arrow",
            direction,
            isAnimating[direction] && "animate"
          );
          return (
            <div
              className="arrows"
              style={
                direction === "outside" && invertArrowColor ? { color } : {}
              }
              key={direction}
            >
              <MdArrowDownward
                className={classNames(className, "top")}
                onTransitionEnd={() => stopAnimation(direction)}
              />
              <MdArrowBack className={classNames(className, "right")} />
              <MdArrowUpward className={classNames(className, "bottom")} />
              <MdArrowForward className={classNames(className, "left")} />
            </div>
          );
        })}

        {children}

        <div>
          <div className="label">{label}</div>
          <div
            className={classNames("alert", isAnimating.text && "animate")}
            onTransitionEnd={() => stopAnimation("text")}
          >
            {alertText || "-"}
          </div>
        </div>
      </div>
    );
  }
);

export default Block;
