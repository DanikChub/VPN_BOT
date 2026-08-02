const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const esmDirectory = path.join(
    root,
    "dist",
    "esm"
);

const cjsDirectory = path.join(
    root,
    "dist",
    "cjs"
);

fs.mkdirSync(
    esmDirectory,
    {
        recursive: true,
    }
);

fs.mkdirSync(
    cjsDirectory,
    {
        recursive: true,
    }
);

fs.writeFileSync(
    path.join(
        esmDirectory,
        "package.json"
    ),
    JSON.stringify(
        {
            type: "module",
        },
        null,
        2
    ) + "\n"
);

fs.writeFileSync(
    path.join(
        cjsDirectory,
        "package.json"
    ),
    JSON.stringify(
        {
            type: "commonjs",
        },
        null,
        2
    ) + "\n"
);