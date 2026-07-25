const ACCESS_TOKEN_KEY =
    "vpn_admin_access_token";

function getToken(): string | null {
    return localStorage.getItem(
        ACCESS_TOKEN_KEY
    );
}

function setToken(token: string): void {
    localStorage.setItem(
        ACCESS_TOKEN_KEY,
        token
    );
}

function removeToken(): void {
    localStorage.removeItem(
        ACCESS_TOKEN_KEY
    );
}

export const tokenStorage = {
    getToken,
    setToken,
    removeToken,
};