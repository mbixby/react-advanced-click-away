# react-advanced-click-away

> A worry-free click away listener for advanced use cases.

[![NPM](https://img.shields.io/npm/v/react-advanced-clickaway.svg)](https://www.npmjs.com/package/react-advanced-click-away)
[![Build](https://img.shields.io/github/checks-status/mbixby/react-advanced-click-away/main)](https://github.com/github/docs/actions/workflows/ci.yml/badge.svg?branch=main)

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

The original version of this component is adapted from [Material UI's ClickAwayListener](https://mui.com/api/click-away-listener/) and inherits basic features like support for touch events and React portals. As a popular community-tested component, it includes [many fixes](https://github.com/mui/material-ui/issues?q=is%3Aissue+is%3Aclosed+clickawaylistener+) for non-obvious issues, like with [handling iframes](https://github.com/mui/material-ui/blob/51289697349/packages/mui-utils/src/ownerDocument.ts) or for [this bug with useEffect timing](https://github.com/mui/material-ui/pull/23315) in React v16.

This library however aims to support some advanced cases when nesting multiple `<ClickAwayListener>` components, which is useful when building nested popovers, menus and modals. Most notably, this `<ClickAwayListener>` can recognise its descendant elements as its content even when the elements stop mouse event propagation to the document.

Check out the [docs and demos]() to see everything in action.

## Props

| Name             | Description                                                                                        |                                                   | Default      |
| ---------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------ |
| onClickAway*     | Handler called on click away                                                                       | (event: MouseEvent &#124; TouchEvent) => void     |
| children         | A ref-accepting child                                                                              | ReactElement                                      |
| mouseEvent       | Mouse click away event to listen to                                                                | "onClick" &#124; "onMouseDown" &#124; "onMouseUp" | "onMouseUp"  |
| touchEvent       | Touch clickaway event to listen to                                                                 | "onTouchStart" &#124; "onTouchEnd"                | "onTouchEnd" |
| disableReactTree | If true, elements inside React portal will be considered to be outside of the click away listener. | boolean                                           | false        |
| useCapture       | If true, the capture phase of the clickaway event will trigger the onClickAway handler instead.    | boolean                                           | false        |

## Attribution

The original version of this component was adapted from Material UI.

https://github.com/mui-org/material-ui/blob/512896/packages/mui-material/src/ClickAwayListener/ClickAwayListener.tsx

## License

This project is licensed under the terms of the
[MIT license](https://github.com/mbixby/react-advanced-click-away/blob/master/LICENSE).
