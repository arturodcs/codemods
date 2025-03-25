import { FileInfo, API, JSCodeshift } from "jscodeshift";

module.exports = function (fileInfo: FileInfo, api: API) {
    const j: JSCodeshift = api.jscodeshift;
    const root = j(fileInfo.source); 

    // step 1: find all async function declarations
    const asyncFunctionDeclarations = root.find(j.FunctionDeclaration, { async: true });
    const asyncFunctionExpressions = root.find(j.FunctionExpression, { async: true });
    const asyncArrowFunctions = root.find(j.ArrowFunctionExpression, { async: true });


    return root.toSource();
};