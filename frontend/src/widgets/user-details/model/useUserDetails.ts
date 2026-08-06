import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    type UserDetails,
    userApi,
} from "@/entities/user";

import {
    getApiErrorMessage,
} from "@/shared/api";


interface UseUserDetailsResult {
    user: UserDetails | null;

    status: {
        isLoading: boolean;
        errorMessage: string | null;
    };

    actions: {
        reload: () => Promise<void>;
    };
}


const useUserDetails = (
    userId: number
): UseUserDetailsResult => {
    const [user, setUser] =
        useState<UserDetails | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);


    const loadUser =
        useCallback(
            async (): Promise<void> => {
                setIsLoading(true);
                setErrorMessage(null);

                try {
                    const response =
                        await userApi.getById(
                            userId
                        );

                    setUser(
                        response.user
                    );
                } catch (error: unknown) {
                    setErrorMessage(
                        getApiErrorMessage(
                            error
                        )
                    );
                } finally {
                    setIsLoading(false);
                }
            },
            [
                userId,
            ]
        );


    useEffect(() => {
        void loadUser();
    }, [
        loadUser,
    ]);


    return {
        user,

        status: {
            isLoading,
            errorMessage,
        },

        actions: {
            reload:
            loadUser,
        },
    };
};


export default useUserDetails;