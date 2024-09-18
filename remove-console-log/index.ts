import { FileInfo, API, JSCodeshift } from "jscodeshift";

module.exports = function (fileInfo: FileInfo, api: API) {
  const j: JSCodeshift = api.jscodeshift;
  const root = j(fileInfo.source);

  const consoleLogExpressions = root.find(j.CallExpression, {
    callee: {
      object: { name: "console" },
      property: { name: "log" },
    },
  });

  consoleLogExpressions.remove();

  return root.toSource();
};
