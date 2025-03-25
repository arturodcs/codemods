import { run as jscodeshift } from "jscodeshift/src/Runner.js";
import path from "node:path";


export async function testTransform(transformPath: string, targetPath: string) {
    const options = {
        extensions: "ts,tsx",
        parser: "tsx",
        verbose: 2,
        dry: true,
    }

    const res = await jscodeshift(
        path.resolve(transformPath),
        [path.resolve(targetPath)],
        options
    )
}
