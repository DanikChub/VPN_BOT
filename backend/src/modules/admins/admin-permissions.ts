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

    "plans.read",
    "plans.create",
    "plans.update",
    "plans.delete",

    "payments.read",
    "payments.recheck",

    "nodes.read",
    "nodes.create",
    "nodes.update",
    "nodes.delete",
    "nodes.sync",

    "marketing_sources.read",
    "marketing_sources.create",
    "marketing_sources.update",
    "marketing_sources.delete",

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

        "plans.read",
        "plans.create",
        "plans.update",
        "plans.delete",

        "subscriptions.read",
        "subscriptions.update",

        "payments.read",
        "payments.recheck",

        "nodes.read",
        "nodes.create",
        "nodes.update",
        "nodes.sync",

        "marketing_sources.read",
        "marketing_sources.create",
        "marketing_sources.update",
        "marketing_sources.delete",
    ],

    support: [
        "users.read",
        "subscriptions.read",
        "plans.read",
        "payments.read",
        "nodes.read",
        "marketing_sources.read",
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