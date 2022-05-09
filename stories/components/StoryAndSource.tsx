import { Canvas, Story, Source, SourceState } from "@storybook/addon-docs";
import React from "react";

const StoryAndSource: React.FC<{ id: string }> = ({ id }) => (
  <>
    <Canvas withSource={SourceState.NONE}>
      <Story id={id} />
    </Canvas>
    <Source id={id} />
  </>
);

export default StoryAndSource;
