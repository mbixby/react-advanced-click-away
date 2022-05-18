import { render } from "@testing-library/react";
import React, { forwardRef, useRef } from "react";
import useForkRef from "../../src/utils/useForkRef";

let refA: React.RefObject<HTMLDivElement> | undefined;
let refB: React.RefObject<HTMLDivElement> | undefined;

const Child = forwardRef((props, parentRef) => {
  const ownRef = useRef<HTMLDivElement | null>(null);
  refA = ownRef;
  const combinedRef = useForkRef(parentRef, ownRef);
  return <div ref={combinedRef} />;
});

const Parent = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  refB = ref;
  return (
    <Child
      ref={(element: HTMLDivElement) => {
        ref.current = element;
      }}
    />
  );
};

it("combines two refs", () => {
  render(<Parent />);
  expect(refA!.current!.tagName).toBe("DIV");
  expect(refA!.current).toBe(refB!.current);
});
