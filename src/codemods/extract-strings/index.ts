import { FileInfo, API, JSCodeshift } from "jscodeshift";

module.exports = function (fileInfo: FileInfo, api: API) {
  const j: JSCodeshift = api.jscodeshift;
  const root = j(fileInfo.source);

  const stringLiterals = root.find(j.StringLiteral);
  
  stringLiterals.forEach((node) => {
    const stringValue = node.value;
    const loc = node.value.loc;
    console.log(`Valor: "${stringValue}"`);
  });

  return root.toSource();
};
