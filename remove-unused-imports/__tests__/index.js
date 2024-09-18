import { defineTest } from "../../utils/testUtils";

jest.autoMockOff();

const tsOptions = {
    parser: "ts",
}

const tsxOptions = {
    parser: "tsx",
}


defineTest(__dirname, "index", null, "unused-default-import");
defineTest(__dirname, "index", null, "unused-named-import");
defineTest(__dirname, "index", null, "unused-namespace-import");
defineTest(__dirname, "index", null, "mixed-import-with-some-unused-specifiers");
defineTest(__dirname, "index", null, "side-effect-import");
defineTest(__dirname, "index", null, "import-used-in-jsx");
defineTest(__dirname, "index", null, "import-mentioned-in-comments");
defineTest(__dirname, "index", null, "import-used-as-type-in-typescript", tsOptions);
defineTest(__dirname, "index", null, "import-used-in-generic-type", tsxOptions);
defineTest(__dirname, "index", null, "unused-renamed-import");
defineTest(__dirname, "index", null, "imports-with-name-conflicts");
defineTest(__dirname, "index", null, "re-exported-import");
defineTest(__dirname, "index", null, "dynamic-import");
defineTest(__dirname, "index", null, "import-with-alias-used");
defineTest(__dirname, "index", null, "multiple-imports-with-some-unused");
defineTest(__dirname, "index", null, "import-used-in-method-chain");
defineTest(__dirname, "index", null, "import-used-as-type-qualifier-in-typescript", tsOptions);
defineTest(__dirname, "index", null, "import-used-in-jsdoc-comment");
defineTest(__dirname, "index", null, "import-used-in-string");
defineTest(__dirname, "index", null, "json-module-import");
defineTest(__dirname, "index", null, "import-used-in-eval");
defineTest(__dirname, "index", null, "import-used-in-template-literal");
defineTest(__dirname, "index", null, "import-used-in-destructuring");
defineTest(__dirname, "index", null, "import-used-in-callback-function");
defineTest(__dirname, "index", null, "conditionally-used-import");
defineTest(__dirname, "index", null, "ignoring-react-default-import");
defineTest(__dirname, "index", null, "keep-first-line-comment");


// TODO: revisar lo de que se elimina el primer comentario