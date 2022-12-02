import React, { useContext } from "react";

/**
 * Adapted from https://github.com/diegohaz/constate/blob/master/src/index.tsx
 */

const NO_PROVIDER = {};

type Selector<Value> = (value: Value) => any;

type SelectorHooks<Selectors> = {
  [K in keyof Selectors]: () => Selectors[K] extends (...args: any) => infer R
    ? R
    : never;
};

type Hooks<Value, Selectors extends Selector<Value>[]> =
  Selectors["length"] extends 0 ? [() => Value] : SelectorHooks<Selectors>;

type ConstateTuple<Props, Value, Selectors extends Selector<Value>[]> = [
  React.FC<Props>,
  ...Hooks<Value, Selectors>
];

const isDev = process.env.NODE_ENV !== "production";

function createUseContext(context: React.Context<any>): any {
  return () => {
    const value = useContext(context);
    if (value === NO_PROVIDER) {
      return undefined;
    }
    return value;
  };
}

/**
 * Version of constate with optional context. The hook will return undefined if it's not
 * wrapped in the context provider.
 */
export default function constate<
  Props,
  Value,
  Selectors extends Selector<Value>[]
>(
  useValue: (props: Props) => Value,
  ...selectors: Selectors
): ConstateTuple<Props, Value, Selectors> {
  const contexts = [] as React.Context<any>[];
  const hooks = [] as unknown as Hooks<Value, Selectors>;

  const createContext = (displayName: string) => {
    const context = React.createContext(NO_PROVIDER);
    if (isDev && displayName) {
      context.displayName = displayName;
    }
    contexts.push(context);
    hooks.push(createUseContext(context));
  };

  if (selectors.length) {
    selectors.forEach((selector) => createContext(selector.name));
  } else {
    createContext(useValue.name);
  }

  const Provider: React.FC<Props> = ({ children, ...props }) => {
    const value = useValue(props as Props);
    let element = children as React.ReactElement;
    for (let i = 0; i < contexts.length; i += 1) {
      const context = contexts[i];
      const selector = selectors[i] || ((v) => v);
      element = (
        <context.Provider value={selector(value)}>{element}</context.Provider>
      );
    }
    return element;
  };

  if (isDev && useValue.name) {
    Provider.displayName = "Constate";
  }

  return [Provider, ...hooks];
}
