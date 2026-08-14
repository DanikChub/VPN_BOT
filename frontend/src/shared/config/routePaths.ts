export const routePaths = {
    login: "/login",

    main: "/",
    users: "/users",
    userDetails: "/users/:id",

    nodes: "/nodes",
    nodeDetails: "/nodes/:id",

    marketingSources: "/marketing-sources",
    marketingSourceDetails: "/marketing-sources/:id",

    payments: "/payments",

    plans: "/plans",

    subscriptions: "/subscriptions",
} as const;

export function getUserDetailsPath(
    userId: number
): string {
    return `/users/${userId}`;
}

export function getNodeDetailsPath(
    nodeId: number
): string {
    return `/nodes/${nodeId}`;
}

export function getMarketingSourceDetailsPath(
    marketingSourceId:number
): string {

    return `/marketing-sources/${marketingSourceId}`;

}