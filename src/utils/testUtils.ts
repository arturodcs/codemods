import fs from "fs";
import path from "path";
import { TransformOptions } from "../types/transform";
import { TestOptions } from "../types/test";

interface Input {
  path?: string;
  source: string;
}

export function applyTransform(
  module: any,
  options: TransformOptions,
  input: Input,
  testOptions: TestOptions = {}
) {
  // Handle ES6 modules using default export for the transform
  const transform = module.default ? module.default : module;

  // Jest resets the module registry after each test, so we need to always get
  // a fresh copy of jscodeshift on every test run.
  let jscodeshift = require("jscodeshift");
  if (testOptions.parser || module.parser) {
    jscodeshift = jscodeshift.withParser(testOptions.parser || module.parser);
  }

  const output = transform(
    input,
    {
      jscodeshift,
      j: jscodeshift,
      stats: () => {},
    },
    options || {}
  );

  return (output || "").trim();
}

export function runSnapshotTest(
  module: any,
  options: TransformOptions,
  input: Input
) {
  const output = applyTransform(module, options, input);
  expect(output).toMatchSnapshot();
  return output;
}

export function runInlineTest(
  module: any,
  options: TransformOptions,
  input: Input,
  expectedOutput: string,
  testOptions?: TestOptions
) {
  const output = applyTransform(module, options, input, testOptions);
  expect(output).toEqual(expectedOutput.trim());
  return output;
}

export function extensionForParser(parser?: string) {
  switch (parser) {
    case "ts":
    case "tsx":
      return parser;
    default:
      return "js";
  }
}

/**
 * Utility function to run a jscodeshift script within a unit test. This makes
 * several assumptions about the environment:
 *
 * - `dirName` contains the name of the directory the test is located in. This
 *   should normally be passed via __dirname.
 * - The test should be located in a subdirectory next to the transform itself.
 *   Commonly tests are located in a directory called __tests__.
 * - `transformName` contains the filename of the transform being tested,
 *   excluding the .js extension.
 * - `testFilePrefix` optionally contains the name of the file with the test
 *   data. If not specified, it defaults to the same value as `transformName`.
 *   This will be suffixed with ".input.js" for the input file and ".output.js"
 *   for the expected output. For example, if set to "foo", we will read the
 *   "foo.input.js" file, pass this to the transform, and expect its output to
 *   be equal to the contents of "foo.output.js".
 * - Test data should be located in a directory called __testfixtures__
 *   alongside the transform and __tests__ directory.
 */
function runTest(
  dirName: string,
  transformName: string,
  options: TransformOptions,
  testFilePrefix?: string,
  testOptions: TestOptions = {}
) {
  if (!testFilePrefix) {
    testFilePrefix = transformName;
  }

  // Assumes transform is one level up from __tests__ directory
  const module = require(path.join(dirName, "..", transformName));
  const extension = extensionForParser(testOptions.parser || module.parser);
  const fixtureDir = path.join(dirName, "..", "__testfixtures__");
  const inputPath = path.join(
    fixtureDir,
    testFilePrefix + `.input.${extension}`
  );
  const source = fs.readFileSync(inputPath, "utf8");
  const expectedOutput = fs.readFileSync(
    path.join(fixtureDir, testFilePrefix + `.output.${extension}`),
    "utf8"
  );
  runInlineTest(
    module,
    options,
    {
      path: inputPath,
      source,
    },
    expectedOutput,
    testOptions
  );
}
exports.runTest = runTest;

/**
 * Handles some boilerplate around defining a simple jest/Jasmine test for a
 * jscodeshift transform.
 */
export function defineTest(
  dirName: string,
  transformName: string,
  options: TransformOptions = {},
  testFilePrefix?: string,
  testOptions?: TestOptions
) {
  const testName = testFilePrefix
    ? `transforms correctly using "${testFilePrefix}" data`
    : "transforms correctly";
  describe(transformName, () => {
    it(testName, () => {
      runTest(dirName, transformName, options, testFilePrefix, testOptions);
    });
  });
}

function defineInlineTest(
  module: any,
  options: TransformOptions,
  input: string,
  expectedOutput: string,
  testName?: string
) {
  it(testName || "transforms correctly", () => {
    runInlineTest(
      module,
      options,
      {
        source: input,
      },
      expectedOutput
    );
  });
}
exports.defineInlineTest = defineInlineTest;

function defineSnapshotTest(
  module: any,
  options: TransformOptions,
  input: string,
  testName?: string
) {
  it(testName || "transforms correctly", () => {
    runSnapshotTest(module, options, {
      source: input,
    });
  });
}
exports.defineSnapshotTest = defineSnapshotTest;

/**
 * Handles file-loading boilerplates, using same defaults as defineTest
 */
export function defineSnapshotTestFromFixture(
  dirName: string,
  module: any,
  options: TransformOptions,
  testFilePrefix: string,
  testName?: string,
  testOptions: TestOptions = {}
) {
  const extension = extensionForParser(testOptions.parser || module.parser);
  const fixtureDir = path.join(dirName, "..", "__testfixtures__");
  const inputPath = path.join(
    fixtureDir,
    testFilePrefix + `.input.${extension}`
  );
  const source = fs.readFileSync(inputPath, "utf8");
  defineSnapshotTest(module, options, source, testName);
}
