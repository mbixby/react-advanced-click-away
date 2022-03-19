const { addons } = require("@storybook/addons");
const { create } = require("@storybook/theming");

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: " ",
    brandUrl: "https://example.com",
    brandImage: undefined,
  }),
});
