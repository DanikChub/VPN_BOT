himport fs from "node:fs";
import path from "node:path";

import {
    fileURLToPath,
} from "node:url";

import protobuf from "protobufjs";


const currentDirectory =
    path.dirname(
        fileURLToPath(
            import.meta.url,
        ),
    );


const protoRoot =
    path.join(
        currentDirectory,
        "proto",
    );


export async function loadXrayProto():
    Promise<protobuf.Root> {

    const protoFiles = [
        path.join(
            protoRoot,
            "app",
            "proxyman",
            "command",
            "command.proto",
        ),

        path.join(
            protoRoot,
            "common",
            "protocol",
            "user.proto",
        ),

        path.join(
            protoRoot,
            "proxy",
            "vless",
            "account.proto",
        ),h

        path.join(
            protoRoot,
            "common",
            "serial",
            "typed_message.proto",
        ),
    ];


    for (const protoFile of protoFiles) {
        if (!fs.existsSync(protoFile)) {
            throw new Error(
                `Xray proto file not found: ${protoFile}`,
            );
        }
    }


    const root =
        new protobuf.Root();


    const defaultResolvePath =
        root.resolvePath.bind(
            root,
        );


    root.resolvePath =
        (
            origin: string,
            target: string,
        ): string => {

            /*
             * Начальные файлы передаются абсолютными путями.
             */
            if (path.isAbsolute(target)) {
                return target;
            }


            /*
             * Импорты Xray имеют вид:
             *
             * common/protocol/user.proto
             * proxy/vless/account.proto
             * common/serial/typed_message.proto
             *
             * Все они считаются относительно protoRoot.
             */
            const xrayProtoPath =
                path.join(
                    protoRoot,
                    target,
                );


            if (
                fs.existsSync(
                    xrayProtoPath,
                )
            ) {
                return xrayProtoPath;
            }


            /*
             * Fallback для стандартных protobuf-импортов
             * и относительных файлов.
             */
            const resolvedPath =
                defaultResolvePath(
                    origin,
                    target,
                );

            if (!resolvedPath) {
                throw new Error(
                    `Unable to resolve proto import "${target}" from "${origin}"`,
                );
            }

            return resolvedPath;
        };


    await root.load(
        protoFiles,
        {
            keepCase:
                true,
        },
    );


    root.resolveAll();


    return root;
}