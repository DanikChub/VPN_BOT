export interface HealthInfo {
    timestamp: string;

    uptimeSeconds: number;

    cpu: {
        count: number;
        model: string;
    };

    memory: {
        total: number;
        free: number;
        used: number;
    };
}