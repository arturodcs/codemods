import {
  ASTPath,
  CallExpression,
  Collection,
  FileInfo,
  ImportSpecifier,
  JSCodeshift,
  TSTypeReference,
  TSUnionType,
} from "jscodeshift";

export function isUsedInScopes(
  j: JSCodeshift,
  root: Collection<any>,
  importSpecifierPath: ASTPath<ImportSpecifier>,
  varName: string
) {
  return (
    root
      .find(j.Identifier, { name: varName })
      .filter((path) => {
        /// ignore the import specifier itself
        if (
          path.parentPath &&
          path.parentPath.value === importSpecifierPath.value
        ) {
          return false;
        }

        // ignore references in MemberExpressions and Properties
        if (
          path.name === "property" &&
          (path.parentPath.value.type === "MemberExpression" ||
            path.parentPath.value.type === "Property")
        ) {
          return false;
        }

        // ignore references in JSXAttributes
        let currentPath = path;
        while (currentPath) {
          // @ts-ignore
          if (currentPath.value.type === "ImportDeclaration") {
            return false;
          }
          currentPath = currentPath.parentPath;
        }
        return true;
      })
      .size() > 0
  );
}

export function isUsedInJSX(
  j: JSCodeshift,
  root: Collection<any>,
  varName: string
) {
  return root.find(j.JSXIdentifier, { name: varName }).size() > 0;
}

function isUsedInTSTypeReference(
  typeParameter: TSTypeReference,
  varName: string
): boolean {
  return (
    typeParameter.typeName.type === "Identifier" &&
    typeParameter.typeName.name === varName
  );
}

function isUsedInTSUnionType(
  typeParameter: TSUnionType,
  varName: string
): boolean {
  return typeParameter.types.some((type) => {
    if (type.type === "TSTypeReference") {
      return isUsedInTSTypeReference(type, varName);
    }
    return false;
  });
}

export function isUsedAsType(
  j: JSCodeshift,
  root: Collection<any>,
  file: FileInfo,
  varName: string
) {
  // TODO: The orignal approach didnt work
  // https://github.com/facebook/jscodeshift/issues/387
  // https://github.com/facebook/jscodeshift/issues/389
  // https://github.com/benjamn/ast-types/issues/343

  const isTypeScriptFile =
    file.path.endsWith(".ts") || file.path.endsWith(".tsx");

  if (!isTypeScriptFile) return false;

  let isUsed = false;

  if (
    root.find(j.TSTypeReference, { typeName: { name: varName } }).size() > 0
  ) {
    return true;
  }

  const callExpressions = root.find(j.CallExpression);
  isUsed = callExpressions.some(
    (callExpressionPath: ASTPath<CallExpression>) => {
      const callExpression = callExpressionPath.node;
      if (!("typeParameters" in callExpression)) return false;

      return (callExpression as any).typeParameters.params.some(
        (typeParameter: TSTypeReference | TSUnionType) => {
          if (typeParameter.type === "TSUnionType") {
            return isUsedInTSUnionType(typeParameter, varName);
          } else if (typeParameter.type === "TSTypeReference") {
            return isUsedInTSTypeReference(typeParameter, varName);
          }
          return false;
        }
      );
    }
  );

  return isUsed;
}
