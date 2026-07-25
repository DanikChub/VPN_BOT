import {
    Navigate,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    ShieldCheck,
} from "lucide-react";

import {
    LoginForm,
    useAuth,
} from "@/features/auth";
import {routePaths} from "@/shared/config/routePaths.ts";



interface LocationState {
    from?: {
        pathname?: string;
    };
}

export function LoginPage() {
    const navigate =
        useNavigate();

    const location =
        useLocation();

    const {
        isAuthenticated,
    } = useAuth();

    const state =
        location.state as
            | LocationState
            | null;

    const redirectPath =
        state?.from?.pathname ??
        routePaths.users;

    if (isAuthenticated) {
        return (
            <Navigate
                replace
                to={routePaths.users}
            />
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
            <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
                <div className="mb-8">
                    <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        <ShieldCheck
                            aria-hidden="true"
                            className="size-6"
                        />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                        Панель управления
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Войдите в административную
                        панель ВПН ИОРДАН
                    </p>
                </div>

                <LoginForm
                    onSuccess={() => {
                        navigate(
                            redirectPath,
                            {
                                replace: true,
                            }
                        );
                    }}
                />
            </section>
        </main>
    );
}