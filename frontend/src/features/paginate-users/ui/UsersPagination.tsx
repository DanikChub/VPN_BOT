import {Button} from "@/shared/ui";
import {
    type UsersPaginationInterface,
} from "@/entities/user";

interface UsersPaginationProps {
    pagination: UsersPaginationInterface;
    isLoading: boolean;

    onPreviousPage: () => void;
    onNextPage: () => void;
}

const UsersPagination = ({
                             pagination,
                             isLoading,
                             onPreviousPage,
                             onNextPage
                         }: UsersPaginationProps) => {
    return (

        pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    Страница {pagination.page}
                    {" из "}
                    {pagination.totalPages}
                </p>

                <div className="flex gap-2">
                    <Button
                        disabled={
                            !pagination.hasPreviousPage ||
                            isLoading
                        }
                        onClick={onPreviousPage}
                        variant="outline"
                    >
                        Назад
                    </Button>

                    <Button
                        disabled={
                            !pagination.hasNextPage ||
                            isLoading
                        }
                        onClick={onNextPage}
                        variant="outline"
                    >
                        Вперёд
                    </Button>
                </div>
            </div>
        )
    )
}

export default UsersPagination;
