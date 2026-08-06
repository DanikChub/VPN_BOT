import type {
    CreateAdminPlanInput,
    UpdateAdminPlanInput,
} from "./admin-plans.types";


const MAX_NAME_LENGTH = 100;
const MAX_DURATION_DAYS = 3650;
const MAX_PRICE_AMOUNT = 100_000_000;


export function parseAdminPlanId(
    value: unknown
): number {
    if (typeof value !== "string") {
        throw new Error(
            "Invalid plan id"
        );
    }

    const planId =
        Number.parseInt(
            value,
            10
        );

    if (
        !Number.isInteger(planId) ||
        planId < 1
    ) {
        throw new Error(
            "Invalid plan id"
        );
    }

    return planId;
}


export function parseCreateAdminPlanInput(
    value: unknown
): CreateAdminPlanInput {
    if (
        !value ||
        typeof value !== "object"
    ) {
        throw new Error(
            "Request body must be an object"
        );
    }

    const body =
        value as Record<
            string,
            unknown
        >;

    return {
        name:
            parseName(
                body.name
            ),

        durationDays:
            parseDurationDays(
                body.durationDays
            ),

        priceAmount:
            parsePriceAmount(
                body.priceAmount
            ),

        currency:
            parseCurrency(
                body.currency
            ),

        isActive:
            body.isActive === undefined
                ? true
                : parseBoolean(
                    body.isActive,
                    "isActive"
                ),
    };
}


export function parseUpdateAdminPlanInput(
    value: unknown
): UpdateAdminPlanInput {
    if (
        !value ||
        typeof value !== "object"
    ) {
        throw new Error(
            "Request body must be an object"
        );
    }

    const body =
        value as Record<
            string,
            unknown
        >;

    const input:
        UpdateAdminPlanInput = {};

    if (body.name !== undefined) {
        input.name =
            parseName(
                body.name
            );
    }

    if (
        body.durationDays !== undefined
    ) {
        input.durationDays =
            parseDurationDays(
                body.durationDays
            );
    }

    if (
        body.priceAmount !== undefined
    ) {
        input.priceAmount =
            parsePriceAmount(
                body.priceAmount
            );
    }

    if (
        body.currency !== undefined
    ) {
        input.currency =
            parseCurrency(
                body.currency
            );
    }

    if (
        body.isActive !== undefined
    ) {
        input.isActive =
            parseBoolean(
                body.isActive,
                "isActive"
            );
    }

    if (
        Object.keys(input).length === 0
    ) {
        throw new Error(
            "At least one field must be provided"
        );
    }

    return input;
}


function parseName(
    value: unknown
): string {
    if (typeof value !== "string") {
        throw new Error(
            "Plan name must be a string"
        );
    }

    const name =
        value.trim();

    if (
        !name ||
        name.length >
        MAX_NAME_LENGTH
    ) {
        throw new Error(
            `Plan name must contain between 1 and ${MAX_NAME_LENGTH} characters`
        );
    }

    return name;
}


function parseDurationDays(
    value: unknown
): number {
    if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 1 ||
        value >
        MAX_DURATION_DAYS
    ) {
        throw new Error(
            `durationDays must be an integer between 1 and ${MAX_DURATION_DAYS}`
        );
    }

    return value;
}


function parsePriceAmount(
    value: unknown
): number {
    if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 0 ||
        value >
        MAX_PRICE_AMOUNT
    ) {
        throw new Error(
            "priceAmount must be a non-negative integer"
        );
    }

    return value;
}


function parseCurrency(
    value: unknown
): string {
    if (typeof value !== "string") {
        throw new Error(
            "Currency must be a string"
        );
    }

    const currency =
        value.trim().toUpperCase();

    if (
        !/^[A-Z]{3}$/.test(
            currency
        )
    ) {
        throw new Error(
            "Currency must contain exactly 3 Latin letters"
        );
    }

    return currency;
}


function parseBoolean(
    value: unknown,
    fieldName: string
): boolean {
    if (typeof value !== "boolean") {
        throw new Error(
            `${fieldName} must be a boolean`
        );
    }

    return value;
}