import { FileInfo, API } from "jscodeshift";

module.exports = function (fileInfo: FileInfo, api: API, options) {
  const j = api.jscodeshift;
  let root = j(fileInfo.source);

  root
    .find(j.VariableDeclaration, {
      kind: "var",
    })
    .forEach((path) => {
      j(path).replaceWith(
        j.variableDeclaration("let", path.value.declarations)
      );
    });

  return root.toSource();
};
