import { Canvas, Story, Source, SourceState } from "@storybook/addon-docs";
import React from "react";

const StoryAndSource: React.FC<{ id: string; of: any }> = ({ id, of }) => (
  <>
    <Canvas withSource={SourceState.NONE}>
      <Story of={of} />
    </Canvas>
    <Source id={id} />
  </>
);

export default StoryAndSource;
