import http from "node:http";

import app from "../app";

import createTestRouter from "../modules/test/test.router";

import {
    commandService,
} from "../infrastructure/container";


export function createHttpServer(){

    app.use(
        "/api/test",
        createTestRouter(
            commandService,
        ),
    );


    return http.createServer(
        app,
    );

}