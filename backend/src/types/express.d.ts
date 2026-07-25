import type Admin from "../modules/admins/admin.model";

declare global {
    namespace Express {
        interface Request {
            admin?: Admin;
        }
    }
}

export {};