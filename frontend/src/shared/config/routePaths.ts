export const routePaths = {
    login: "/login",

    main: "/",
    users: "/users",
    userDetails: "/users/:id",

    nodes: "/nodes",

    payments: "/payments",

    plans: "/plans",

    subscriptions: "/subscriptions",
} as const;

export function getUserDetailsPath(
    userId: number
): string {
    return `/users/${userId}`;
}