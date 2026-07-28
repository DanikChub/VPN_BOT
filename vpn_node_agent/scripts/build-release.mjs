import {
    access,
    cp,
    mkdir,
    rm,
    stat,
} from "node:fs/promises";

import {
    constants,
} from "node:fs";

import {
    spawnSync,
} from "node:child_process";

import path from "node:path";
import process from "node:process";


const projectRoot =
    process.cwd();

const distPath =
    path.join(
        projectRoot,
        "dist",
    );

const sourceProtoPath =
    path.join(
        projectRoot,
        "src",
        "xray",
        "api",
        "proto",
    );

const distProtoPath =
    path.join(
        distPath,
        "xray",
        "api",
        "proto",
    );

const releaseDirectory =
    path.resolve(
        projectRoot,
        "../backend/storage/releases",
    );

const releaseArchive =
    path.join(
        releaseDirectory,
        "vpn-node-agent.tar.gz",
    );

const requiredProtoPath =
    path.join(
        distProtoPath,
        "app",
        "proxyman",
        "command",
        "command.proto",
    );


function run(
    command,
    args,
) {
    console.log(
        `[release] ${command} ${args.join(" ")}`,
    );

    const result =
        spawnSync(
            command,
            args,
            {
                cwd:
                projectRoot,

                stdio:
                    "inherit",

                shell:
                    process.platform ===
                    "win32",
            },
        );

    if (
        result.error
    ) {
        throw result.error;
    }

    if (
        result.status !== 0
    ) {
        throw new Error(
            `Command failed with exit code ${result.status}: ` +
            `${command} ${args.join(" ")}`,
        );
    }
}


async function assertFileExists(
    filePath,
) {
    await access(
        filePath,
        constants.R_OK,
    );

    const fileStats =
        await stat(
            filePath,
        );

    if (
        !fileStats.isFile()
    ) {
        throw new Error(
            `Expected a file: ${filePath}`,
        );
    }
}


async function main() {
    console.log(
        "[release] Installing exact dependencies from package-lock.json",
    );

    run(
        "npm",
        [
            "ci",
        ],
    );


    console.log(
        "[release] Cleaning dist",
    );

    await rm(
        distPath,
        {
            recursive:
                true,

            force:
                true,
        },
    );


    console.log(
        "[release] Compiling TypeScript",
    );

    run(
        "npm",
        [
            "run",
            "build",
        ],
    );


    console.log(
        "[release] Copying Xray proto files",
    );

    await cp(
        sourceProtoPath,
        distProtoPath,
        {
            recursive:
                true,
        },
    );


    console.log(
        "[release] Checking copied proto files",
    );

    await assertFileExists(
        requiredProtoPath,
    );


    console.log(
        "[release] Preparing backend release directory",
    );

    await mkdir(
        releaseDirectory,
        {
            recursive:
                true,
        },
    );

    await rm(
        releaseArchive,
        {
            force:
                true,
        },
    );


    console.log(
        "[release] Creating archive",
    );

    run(
        "tar",
        [
            "-czf",
            releaseArchive,

            "dist",
            "node_modules",
            "package.json",
            "package-lock.json",
        ],
    );


    console.log(
        "[release] Verifying archive",
    );

    const verification =
        spawnSync(
            "tar",
            [
                "-tf",
                releaseArchive,
            ],
            {
                cwd:
                projectRoot,

                encoding:
                    "utf8",

                shell:
                    process.platform ===
                    "win32",
            },
        );

    if (
        verification.error
    ) {
        throw verification.error;
    }

    if (
        verification.status !== 0
    ) {
        throw new Error(
            "Failed to inspect generated archive",
        );
    }

    const normalizedEntries =
        verification.stdout
            .replaceAll(
                "\\",
                "/",
            );

    const requiredArchiveEntries = [
        "dist/index.js",

        "dist/xray/api/proto/app/proxyman/command/command.proto",

        "dist/xray/api/proto/common/protocol/user.proto",

        "package.json",

        "package-lock.json",
    ];

    for (
        const requiredEntry
        of requiredArchiveEntries
        ) {
        if (
            !normalizedEntries.includes(
                requiredEntry,
            )
        ) {
            throw new Error(
                `Archive does not contain required file: ${requiredEntry}`,
            );
        }
    }


    const archiveStats =
        await stat(
            releaseArchive,
        );

    console.log(
        `[release] Archive created successfully`,
    );

    console.log(
        `[release] Path: ${releaseArchive}`,
    );

    console.log(
        `[release] Size: ${Math.ceil(
            archiveStats.size / 1024 / 1024,
        )} MB`,
    );
}


main()
    .catch(
        error => {
            console.error(
                "[release] Failed:",
                error,
            );

            process.exitCode =
                1;
        },
    );