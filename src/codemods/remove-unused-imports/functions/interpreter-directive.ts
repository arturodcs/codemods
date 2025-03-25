import {
  ASTPath,
  Collection,
  InterpreterDirective,
  JSCodeshift,
} from "jscodeshift";
import { removeNode } from "./jscodeshift";

export function getInterpreterDirectivePath(
  j: JSCodeshift,
  root: Collection<any>
): ASTPath<InterpreterDirective> | null {
  const interpreterDirective = root.find(j.InterpreterDirective);
  if (interpreterDirective.size() !== 0) {
    return root.find(j.InterpreterDirective).get();
  } else {
    return null;
  }
}

export function removeInterpreterDirective(j: JSCodeshift, root: Collection<any>, interpreterDirectivePath: ASTPath<InterpreterDirective>) {
    const interpreterDirectiveValue = interpreterDirectivePath.node.value;
    removeNode(j, interpreterDirectivePath);

    return interpreterDirectiveValue;
}
