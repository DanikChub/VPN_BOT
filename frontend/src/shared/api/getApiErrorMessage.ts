import axios from "axios";

import type {
    ApiErrorResponse,
} from "./api.types";

const DEFAULT_ERROR_MESSAGE =
    "Произошла неизвестная ошибка";

export function getApiErrorMessage(
    error: unknown
): string {
    if (
        axios.isAxiosError<
            ApiErrorResponse
        >(error)
    ) {
        return (
            error.response?.data?.message ??
            error.message ??
            DEFAULT_ERROR_MESSAGE
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return DEFAULT_ERROR_MESSAGE;
}