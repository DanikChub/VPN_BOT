import type {
    AdminRole,
} from "./admin.model";

export const adminPermissions = [
    "users.read",
    "users.update",
    "users.block",
    "users.balance.update",

    "subscriptions.read",
    "subscriptions.update",

    "payments.read",
    "payments.recheck",

    "nodes.read",
    "nodes.create",
    "nodes.update",
    "nodes.delete",
    "nodes.sync",

    "admins.read",
    "admins.create",
    "admins.update",
    "admins.block",

    "audit.read",
] as const;

export type AdminPermission =
    typeof adminPermissions[number];

const rolePermissions: Record<
    AdminRole,
    readonly AdminPermission[] | "*"
> = {
    superadmin: "*",

    admin: [
        "users.read",
        "users.update",
        "users.block",
        "users.balance.update",

        "subscriptions.read",
        "subscriptions.update",

        "payments.read",
        "payments.recheck",

        "nodes.read",
        "nodes.create",
        "nodes.update",
        "nodes.sync",
    ],

    support: [
        "users.read",
        "subscriptions.read",
        "payments.read",
        "nodes.read",
    ],
};

export function adminHasPermission(
    role: AdminRole,
    permission: AdminPermission
): boolean {
    const permissions = rolePermissions[role];

    if (permissions === "*") {
        return true;
    }

    return permissions.includes(permission);
}

export function adminHasEveryPermission(
    role: AdminRole,
    permissions: AdminPermission[]
): boolean {
    return permissions.every((permission) =>
        adminHasPermission(role, permission)
    );
}