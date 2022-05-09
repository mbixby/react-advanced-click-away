import { invert, mapValues } from "lodash";
import mappedReplace from "mapped-replace";
import React, { useCallback, useState } from "react";
import constate from "../../src/utils/constate";
import * as colors from "./colors";

const [ActionProvider, useActions] = constate(() => {
  const [actionLog, setActionLog] = useState<{
    [message: string]: { count: number; humanizedMessage: string };
  }>({});
  const action = useCallback((message: string) => {
    return () => {
      setActionLog((previousLog) => {
        const previousEntry = previousLog[message] ?? {
          count: 0,
          humanizedMessage: mappedReplace(message, invert(colors)),
        };
        return {
          ...previousLog,
          [message]: { ...previousEntry, count: previousEntry.count + 1 },
        };
      });
    };
  }, []);
  return { actionLog, action };
});

export { ActionProvider, useActions };

export const ActionLog = () => {
  const { actionLog } = useActions();
  if (!actionLog.length) {
    return null;
  }
  return (
    <div
      style={{
        width: 500,
        marginTop: 16,
        lineHeight: 1.2,
        cursor: "default",
        boxSizing: "border-box",
        fontFamily: "Menlo, monospace",
        fontSize: 11,
        color: "rgba(0, 0, 0,0.4)",
      }}
    >
      <div style={{ overflowY: "auto", maxHeight: "7.2em" }}>
        {mapValues(actionLog, ({ count, humanizedMessage }, index) => (
          <div key={String(index)}>
            <span style={{ display: "inline-block", marginRight: 4 }}>
              [{count}]
            </span>
            <span style={{ color: "rgb(196, 26, 22)" }}>
              {humanizedMessage}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
