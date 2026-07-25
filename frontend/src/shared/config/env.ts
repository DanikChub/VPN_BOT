const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
    throw new Error(
        "Переменная окружения VITE_API_URL не задана"
    );
}

export const env = {
    apiUrl,
} as const;