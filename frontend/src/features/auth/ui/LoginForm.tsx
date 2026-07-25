import {
    useState,
    type FormEvent,
} from "react";

import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
} from "lucide-react";

import {
    getApiErrorMessage,
} from "@/shared/api";

import {
    useAuth,
} from "../model/useAuth";
import {Button, Input} from "@/shared/ui";

interface LoginFormProps {
    onSuccess?: () => void;
}

export function LoginForm({
                              onSuccess,
                          }: LoginFormProps) {
    const {
        login,
    } = useAuth();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [
        isPasswordVisible,
        setIsPasswordVisible,
    ] = useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ): Promise<void> {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const normalizedEmail =
            email.trim();

        if (!normalizedEmail) {
            setErrorMessage(
                "Введите электронную почту"
            );

            return;
        }

        if (!password) {
            setErrorMessage(
                "Введите пароль"
            );

            return;
        }

        setErrorMessage(null);
        setIsSubmitting(true);

        try {
            await login({
                email: normalizedEmail,
                password,
            });

            onSuccess?.();
        } catch (error: unknown) {
            setErrorMessage(
                getApiErrorMessage(error)
            );
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <form
            className="space-y-5"
            onSubmit={handleSubmit}
        >
            <Input
                autoComplete="email"
                disabled={isSubmitting}
                id="email"
                label="Электронная почта"
                leftIcon={
                    <Mail
                        aria-hidden="true"
                        className="size-5"
                    />
                }
                name="email"
                onChange={(event) => {
                    setEmail(
                        event.target.value
                    );
                }}
                placeholder="admin@example.com"
                type="email"
                value={email}
            />

            <Input
                autoComplete="current-password"
                disabled={isSubmitting}
                id="password"
                label="Пароль"
                leftIcon={
                    <LockKeyhole
                        aria-hidden="true"
                        className="size-5"
                    />
                }
                name="password"
                onChange={(event) => {
                    setPassword(
                        event.target.value
                    );
                }}
                placeholder="Введите пароль"
                rightElement={
                    <button
                        aria-label={
                            isPasswordVisible
                                ? "Скрыть пароль"
                                : "Показать пароль"
                        }
                        className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        onClick={() => {
                            setIsPasswordVisible(
                                (current) =>
                                    !current
                            );
                        }}
                        type="button"
                    >
                        {isPasswordVisible
                            ? (
                                <EyeOff
                                    aria-hidden="true"
                                    className="size-5"
                                />
                            )
                            : (
                                <Eye
                                    aria-hidden="true"
                                    className="size-5"
                                />
                            )}
                    </button>
                }
                type={
                    isPasswordVisible
                        ? "text"
                        : "password"
                }
                value={password}
            />

            {errorMessage && (
                <div
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    role="alert"
                >
                    {errorMessage}
                </div>
            )}

            <Button
                className="w-full"
                isLoading={isSubmitting}
                type="submit"
            >
                {isSubmitting
                    ? "Выполняется вход..."
                    : "Войти"}
            </Button>
        </form>
    );
}