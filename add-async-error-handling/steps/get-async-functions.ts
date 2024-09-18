import { Collection, JSCodeshift } from "jscodeshift";

export function getFunctionDeclarations(j: JSCodeshift, root: Collection<any>) {
  return root.find(j.FunctionDeclaration, { async: true });
}
