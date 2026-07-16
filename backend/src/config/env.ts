const requiredEnv = (name: string): string => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`${name} is not defined`);
    }

    return value;
}

export const env = {
    port: Number(process.env.PORT) || 5000,

    database: {
        host: requiredEnv("DB_HOST"),
        port: Number(process.env.DB_PORT) || 5432,
        name: requiredEnv("DB_NAME"),
        user: requiredEnv("DB_USER"),
        password: requiredEnv("DB_PASSWORD"),
    }
}