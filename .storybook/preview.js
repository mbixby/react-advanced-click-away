import prettier from "prettier/standalone";
import prettierBabel from "prettier/parser-babel";
import { themes } from "@storybook/theming";
import { ActionProvider } from "../src/stories/components/Actions";

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
  (Story) => (
    <ActionProvider>
      <Story />
    </ActionProvider>
  ),
];
