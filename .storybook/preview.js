import { themes } from "@storybook/theming";
import prettierBabel from "prettier/parser-babel";
import prettier from "prettier/standalone";
import React from "react";
import { ActionProvider } from "../stories/components/Actions";

// window.global = window;
// window.global = window;

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  options: {
    storySort: {
      method: "alphabetical",
      order: [
        "Intro",
        "Basic usage",
        "Nesting",
        "Event propagation",
        "Popovers",
        "Modals",
      ],
    },
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewMode: "docs",
  docs: {
    theme: themes.light,
    source: {
      type: "code",
      format: true,
      dark: false,
    },
    transformSource: (input) =>
      prettier.format(input, {
        parser: "babel",
        plugins: [prettierBabel],
      }),
  },
};

export const decorators = [
  (Story) =>
    React.createElement(ActionProvider, {
      children: React.createElement(Story),
    }),
];
