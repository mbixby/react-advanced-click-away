const { addons } = require("@storybook/addons");
const { create } = require("@storybook/theming");

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: " ",
    brandUrl: "https://example.com",
    brandImage: undefined,
  }),
  isFullscreen: false,
  showNav: true,
  showPanel: false,
  isToolshown: false,
  sidebar: {
    showRoots: true,
    collapsedRoots: ["stories"],
  },
});
