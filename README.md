# react-advanced-click-away

> A worry-free click away listener for advanced use cases.

[![NPM](https://img.shields.io/npm/v/react-advanced-click-away)](https://www.npmjs.com/package/react-advanced-click-away)
[![CI](https://img.shields.io/github/actions/workflow/status/mbixby/react-advanced-click-away/ci.yml?branch=main)](https://github.com/mbixby/react-advanced-click-away/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/mbixby/react-advanced-click-away.svg)](https://codecov.io/gh/mbixby/react-advanced-click-away/branch/main)

## Installation

```sh
npm install --save react-advanced-click-away
# or
yarn add react-advanced-click-away
```

## Simple example

```jsx
import React from 'react';
import ClickAwayListener from 'react-advanced-click-away';

const MyComponent = () => (
  <ClickAwayListener onClickAway={() => console.log('Clicked away!')}>
    <div>
      Inside
    </div>
  </ClickAwayListener>
);

export default MyComponent;
```

## Motivation

The original version of this component is adapted from [Material UI's ClickAwayListener](https://mui.com/api/click-away-listener/) and inherits basic features like support for touch events and React portals, as well as [many fixes](https://github.com/mui/material-ui/issues?q=is%3Aissue+is%3Aclosed+clickawaylistener+) for non-obvious issues, like with [handling iframes](https://github.com/mui/material-ui/blob/51289697349/packages/mui-utils/src/ownerDocument.ts) or for [this bug with useEffect timing](https://github.com/mui/material-ui/pull/23315) in React v16. It passes all of Material UI's original unit tests<sup>1</sup>.

This library however aims to support some advanced cases when nesting multiple `<ClickAwayListener>` components, which is useful when building nested popovers, menus and modals. Notably, we listen to events during the capture phase, which often lets us stop mouse event propagation elsewhere our React tree without affecting the click away behaviour of unrelated components.

## [Docs and demos](https://mbixby.github.io/react-advanced-click-away)

Check out the [docs and demos](https://mbixby.github.io/react-advanced-click-away) to see everything in action.

## Props

| Name             | Description                                                                                   |         | Default |
|------------------|-----------------------------------------------------------------------------------------------|---------|---------|
| onClickAway*     | Handler called on click away                                                                  | (event: MouseEvent &#124; TouchEvent) => void     |
| children         | A ref-accepting child                                                                         | ReactElement                                      |
| mouseEvent       | Mouse click away event to listen to                                                           | "click" &#124; "mousedown" &#124; "mouseup" | "mousedown"  |
| touchEvent       | Touch click away event to listen to                                                            | "touchstart" &#124; "touchend"                | "touchstart" |
| disableReactTree | If true, elements inside portals will be considered to be outside of the click away listener. | boolean | false   |
| ignoreScrollbars | If true, clicking the window scrollbars will not trigger the `onClickAway()` handler.         | boolean | false   |
| layer            | Root element, `document` by default.                                                          | boolean |        |

## Layers

Wrap modal contents in a `<ClickAwayLayer>` to freeze any click away listeners underneath the modal.

If building modals you may also consider [locking scroll](https://github.com/theKashey/react-focus-lock), [locking focus](https://github.com/FL3NKEY/scroll-lock) and in some cases stopping event propagation.

```jsx
// Click away listeners underneath the modal will be disabled until the modal is unmounted.
const BaseModal = ({ open, children }) => (
  <>
    {open && (
      <ScrollLock>
        <FocusLock>
          <StopPropagation all>
            <ClickAwayLayer>
              <div role="dialog">{children}</div>
            </ClickAwayLayer>
          </StopPropagation>
        </FocusLock>
      </ScrollLock>
    )}
  </>
);

// Don't forget to establish a root layer in the app.
// This is not needed if you don't use click away layers.
const App = ({ children }) => <ClickAwayLayer root><Component /></Layer>
```

See docs for examples of usage.

## Attribution

The original version of this component was adapted from Material UI.

https://github.com/mui-org/material-ui/blob/512896/packages/mui-material/src/ClickAwayListener/ClickAwayListener.tsx

## License

This project is licensed under the terms of the
[MIT license](https://github.com/mbixby/react-advanced-click-away/blob/master/LICENSE).

-------

<sup>1. With one minor prop change in `mouseEvent` / `touchEvent`. Compatibility with MUI is not guaranteed.</sup>

