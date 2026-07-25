const fs = require("node:fs");
const path = require("node:path");

const directory = path.resolve(
    __dirname,
    "../dist/cjs",
);

fs.mkdirSync(directory, {
    recursive: true,
});

fs.writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify(
        {
            type: "commonjs",
        },
        null,
        2,
    ),
);