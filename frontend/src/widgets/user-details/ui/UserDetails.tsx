import {
    useParams,
} from "react-router-dom";

import useUserDetails
    from "../model";

import UserDetailsContent
    from "./UserDetailsContent";


export function UserDetails() {
    const {
        id,
    } = useParams<{
        id: string;
    }>();

    const userId =
        Number(id);

    const isValidUserId =
        Number.isInteger(userId) &&
        userId > 0;

    if (!isValidUserId) {
        return (
            <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                Некорректный ID пользователя
            </div>
        );
    }

    return (
        <UserDetailsLoader
            userId={userId}
        />
    );
}


interface UserDetailsLoaderProps {
    userId: number;
}


function UserDetailsLoader({
                               userId,
                           }: UserDetailsLoaderProps) {
    const {
        user,
        status,
        actions
    } = useUserDetails(
        userId
    );

    return (
        <UserDetailsContent
            user={user}
            isLoading={
                status.isLoading
            }
            errorMessage={
                status.errorMessage
            }
            onReload={
                actions.reload
            }
        />
    );
}