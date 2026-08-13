import {
    HardDrive,
} from "lucide-react";

import {
    type VpnNode, vpnNodeApi,
} from "@/entities/vpn-node";

import {
    Badge, Button,
    Card,
    CardContent,
    DetailsRow,
    EmptyState, Input, Modal,
    Spinner,
} from "@/shared/ui";

import {
    formatDate,
} from "@/shared/lib";
import {useState} from "react";


interface NodeDetailsContentProps {
    node:
        | VpnNode
        | null;

    isLoading: boolean;

    errorMessage:
        | string
        | null;

    onReload: () =>
        Promise<void>;
}


const NodeDetailsContent = ({
                                node,
                                isLoading,
                                errorMessage,
                                onReload
                            }: NodeDetailsContentProps) => {
    if (errorMessage) {
        return (
            <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
            >
                {errorMessage}
            </div>
        );
    }


    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex min-h-72 items-center justify-center">
                    <Spinner
                        size="lg"
                    />
                </CardContent>
            </Card>
        );
    }


    if (!node) {
        return (
            <EmptyState
                description="Нода отсутствует или была удалена."
                icon={
                    <HardDrive className="size-6" />
                }
                title="Нода не найдена"
            />
        );
    }


    return (
        <div className="space-y-5">

            <div className="grid gap-5 xl:grid-cols-2">

                <Card>
                    <CardContent>
                        <CardTitle>
                            Основная информация
                        </CardTitle>

                        <div className="mt-5 space-y-4">
                            <DetailsRow
                                label="ID"
                                value={
                                    node.id
                                }
                            />

                            <DetailsRow
                                label="Название"
                                value={
                                    node.name
                                }
                            />

                            <DetailsRow
                                label="Роль"
                                value={
                                    getRoleLabel(
                                        node.role,
                                    )
                                }
                            />

                            <DetailsRow
                                label="Активна"
                                value={
                                    node.is_active
                                        ? "Да"
                                        : "Нет"
                                }
                            />
                        </div>
                    </CardContent>
                </Card>


                <HappNodePreview
                    node={node}
                    onUpdated={() => {
                        void onReload();
                    }}
                />

            </div>

            <div className="grid gap-5 xl:grid-cols-2">

                <Card>
                    <CardContent>
                        <CardTitle>
                            Основная информация
                        </CardTitle>

                        <div className="mt-5 space-y-4">
                            <DetailsRow
                                label="ID"
                                value={
                                    node.id
                                }
                            />

                            <DetailsRow
                                label="Название"
                                value={
                                    node.name
                                }
                            />

                            <DetailsRow
                                label="Роль"
                                value={
                                    getRoleLabel(
                                        node.role,
                                    )
                                }
                            />

                            <DetailsRow
                                label="Активна"
                                value={
                                    node.is_active
                                        ? "Да"
                                        : "Нет"
                                }
                            />
                        </div>
                    </CardContent>
                </Card>


                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between gap-4">
                            <CardTitle>
                                Состояние
                            </CardTitle>

                            <NodeStatusBadge
                                status={
                                    node.status
                                }
                            />
                        </div>

                        <div className="mt-5 space-y-4">
                            <DetailsRow
                                label="Статус"
                                value={
                                    getNodeStatusLabel(
                                        node.status,
                                    )
                                }
                            />

                            <DetailsRow
                                label="Последний heartbeat"
                                value={
                                    node.last_seen_at
                                        ? formatDate(
                                            node.last_seen_at,
                                        )
                                        : "Нет данных"
                                }
                            />

                            <DetailsRow
                                label="Uptime"
                                value={
                                    formatUptime(
                                        node.uptime_seconds,
                                    )
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

            </div>


            <div className="grid gap-5 xl:grid-cols-2">

                <Card>
                    <CardContent>
                        <CardTitle>
                            Подключение
                        </CardTitle>

                        <div className="mt-5 space-y-4">
                            <DetailsRow
                                label="Host"
                                value={
                                    node.host
                                }
                                monospace
                            />

                            <DetailsRow
                                label="Port"
                                value={
                                    node.port
                                }
                            />

                            <DetailsRow
                                label="SSH port"
                                value={
                                    node.ssh_port
                                }
                            />

                            <DetailsRow
                                label="SSH user"
                                value={
                                    node.ssh_user
                                }
                                monospace
                            />

                            <DetailsRow
                                label="Inbound tag"
                                value={
                                    node.inbound_tag
                                }
                                monospace
                            />
                        </div>
                    </CardContent>
                </Card>


                <Card>
                    <CardContent>
                        <CardTitle>
                            Reality
                        </CardTitle>

                        <div className="mt-5 space-y-4">
                            <DetailsRow
                                label="Server name"
                                value={
                                    node.reality_server_name ||
                                    "Не настроено"
                                }
                                monospace
                            />

                            <DetailsRow
                                label="Public key"
                                value={
                                    node.reality_public_key ||
                                    "Не настроено"
                                }
                                monospace
                            />

                            <DetailsRow
                                label="Short ID"
                                value={
                                    node.reality_short_id ||
                                    "Не настроено"
                                }
                                monospace
                            />
                        </div>
                    </CardContent>
                </Card>

            </div>


            <div className="grid gap-5 xl:grid-cols-2">

                <Card>
                    <CardContent>
                        <CardTitle>
                            Ресурсы сервера
                        </CardTitle>

                        <div className="mt-5 space-y-4">
                            <DetailsRow
                                label="CPU"
                                value={
                                    node.cpu_model ??
                                    "Нет данных"
                                }
                            />

                            <DetailsRow
                                label="Количество CPU"
                                value={
                                    node.cpu_count ??
                                    "Нет данных"
                                }
                            />

                            <DetailsRow
                                label="Память"
                                value={
                                    formatMemoryUsage(
                                        node.memory_used,
                                        node.memory_total,
                                    )
                                }
                            />

                            <DetailsRow
                                label="Использовано памяти"
                                value={
                                    formatBytes(
                                        node.memory_used,
                                    )
                                }
                            />

                            <DetailsRow
                                label="Всего памяти"
                                value={
                                    formatBytes(
                                        node.memory_total,
                                    )
                                }
                            />
                        </div>
                    </CardContent>
                </Card>


                <Card>
                    <CardContent>
                        <CardTitle>
                            Gateway / CDN
                        </CardTitle>

                        <div className="mt-5 space-y-4">
                            <DetailsRow
                                label="Роль"
                                value={
                                    getRoleLabel(
                                        node.role,
                                    )
                                }
                            />

                            <DetailsRow
                                label="CDN host"
                                value={
                                    node.cdn_host ??
                                    "Не используется"
                                }
                                monospace
                            />
                        </div>
                    </CardContent>
                </Card>

            </div>

        </div>
    );
};


interface CardTitleProps {
    children: React.ReactNode;
}


function CardTitle({
                       children,
                   }: CardTitleProps) {
    return (
        <h2 className="text-lg font-semibold text-slate-950">
            {children}
        </h2>
    );
}


interface NodeStatusBadgeProps {
    status:
        | "online"
        | "offline";
}


function NodeStatusBadge({
                             status,
                         }: NodeStatusBadgeProps) {
    if (
        status === "online"
    ) {
        return (
            <Badge>
                Online
            </Badge>
        );
    }

    return (
        <Badge>
            Offline
        </Badge>
    );
}


interface HappNodePreviewProps {
    node: VpnNode;

    onUpdated?: (
        node: VpnNode,
    ) => void;
}


function HappNodePreview({
                             node,
                             onUpdated,
                         }: HappNodePreviewProps) {
    const [
        isOpen,
        setIsOpen,
    ] = useState(false);

    const [
        displayName,
        setDisplayName,
    ] = useState(
        node.display_name ??
        node.name,
    );

    const [
        countryCode,
        setCountryCode,
    ] = useState(
        node.country_code ??
        "",
    );

    const [
        isSaving,
        setIsSaving,
    ] = useState(false);


    const country =
        node.country_code ??
        "--";

    const previewName =
        node.display_name ??
        node.name;


    const handleOpen = () => {
        setDisplayName(
            node.display_name ??
            node.name,
        );

        setCountryCode(
            node.country_code ??
            "",
        );

        setIsOpen(true);
    };


    const handleSave =
        async () => {
            setIsSaving(true);

            try {
                let updatedNode =
                    node;

                if (
                    displayName !==
                    (
                        node.display_name ??
                        node.name
                    )
                ) {
                    updatedNode =
                        await vpnNodeApi
                            .updateField(
                                node.id,
                                "display_name",
                                displayName,
                            );
                }

                if (
                    countryCode !==
                    (
                        node.country_code ??
                        ""
                    )
                ) {
                    updatedNode =
                        await vpnNodeApi
                            .updateField(
                                node.id,
                                "country_code",
                                countryCode ||
                                null,
                            );
                }

                onUpdated?.(
                    updatedNode,
                );

                setIsOpen(false);

            } finally {
                setIsSaving(false);
            }
        };


    return (
        <>
            <button
                type="button"
                onClick={
                    handleOpen
                }
                className="
                    group
                    relative
                    min-h-[230px]
                    w-full
                    overflow-hidden
                    rounded-xl
                    border
                    border-transparent
                    bg-[#18191d]
                    p-6
                    text-left
                    text-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-white/10
                    hover:shadow-lg
                    focus:outline-none
                    focus:ring-2
                    focus:ring-slate-400/40
                "
            >
                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-white/[0.02]
                        opacity-0
                        transition-opacity
                        duration-200
                        group-hover:opacity-100
                    "
                />

                <div
                    className="
                        pointer-events-none
                        absolute
                        -right-16
                        -top-20
                        size-52
                        rounded-full
                        bg-white/[0.035]
                    "
                />

                <div
                    className="
                        pointer-events-none
                        absolute
                        -bottom-24
                        -left-12
                        size-48
                        rounded-full
                        bg-white/[0.025]
                    "
                />

                <div className="relative flex h-full flex-col">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
                                HAPP
                            </div>

                            <h2 className="mt-1 text-sm font-medium text-white/70">
                                Preview
                            </h2>
                        </div>

                        <div className="rounded-full bg-white/[0.07] px-3 py-1 text-xs font-medium text-white/50">
                            #{node.sort_order}
                        </div>
                    </div>

                    <div className="mt-10 flex items-center gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.07] text-base font-semibold uppercase tracking-wider text-white">
                            {country}
                        </div>

                        <div className="min-w-0">
                            <div className="truncate text-xl font-semibold tracking-tight text-white">
                                {previewName}
                            </div>

                            <div className="mt-1 text-sm text-white/40">
                                {getCountryLabel(
                                    node.country_code,
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-8">
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                                display name
                            </div>

                            <div className="mt-1 text-xs text-white/45">
                                {previewName}
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                                country
                            </div>

                            <div className="mt-1 font-mono text-xs text-white/45">
                                {country}
                            </div>
                        </div>
                    </div>
                </div>
            </button>


            <Modal
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false);
                }}
                title="Настройки отображения HAPP"
            >
                <div className="space-y-5">

                    <Input
                        label="Название"
                        value={
                            displayName
                        }
                        onChange={(
                            event
                        ) => {
                            setDisplayName(
                                event.target.value,
                            );
                        }}
                        placeholder="Amsterdam"
                    />


                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Страна
                        </label>

                        <select
                            value={
                                countryCode
                            }
                            onChange={(
                                event
                            ) => {
                                setCountryCode(
                                    event.target.value,
                                );
                            }}
                            className="
                                w-full
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                px-3
                                py-2
                                text-sm
                                text-slate-950
                                outline-none
                                transition
                                focus:border-slate-400
                                focus:ring-2
                                focus:ring-slate-200
                            "
                        >
                            <option value="">
                                Не выбрана
                            </option>

                            {COUNTRIES.map(
                                (
                                    country
                                ) => (
                                    <option
                                        key={
                                            country.code
                                        }
                                        value={
                                            country.code
                                        }
                                    >
                                        {
                                            country.name
                                        } (
                                        {
                                            country.code
                                        })
                                    </option>
                                ),
                            )}
                        </select>
                    </div>


                    <div className="flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIsOpen(false);
                            }}
                        >
                            Отмена
                        </Button>

                        <Button
                            disabled={
                                isSaving
                            }
                            onClick={
                                handleSave
                            }
                        >
                            {isSaving
                                ? "Сохранение..."
                                : "Сохранить"}
                        </Button>
                    </div>

                </div>
            </Modal>
        </>
    );
}


const COUNTRIES = [
    {
        code: "NL",
        name: "Netherlands",
    },
    {
        code: "DE",
        name: "Germany",
    },
    {
        code: "FI",
        name: "Finland",
    },
    {
        code: "FR",
        name: "France",
    },
    {
        code: "GB",
        name: "United Kingdom",
    },
    {
        code: "US",
        name: "United States",
    },
    {
        code: "SE",
        name: "Sweden",
    },
    {
        code: "PL",
        name: "Poland",
    },
    {
        code: "CH",
        name: "Switzerland",
    },
];


function getCountryLabel(
    countryCode:
        | string
        | null,
): string {
    if (!countryCode) {
        return "Страна не указана";
    }

    return (
        COUNTRIES.find(
            (
                country
            ) =>
                country.code ===
                countryCode.toUpperCase(),
        )?.name ??
        countryCode
    );
}


function getNodeStatusLabel(
    status: VpnNode["status"],
): string {
    switch (status) {
        case "online":
            return "Онлайн";

        case "offline":
            return "Оффлайн";

        default:
            return "Неизвестно";
    }
}




function getRoleLabel(
    role: VpnNode["role"],
): string {
    switch (role) {
        case "exit":
            return "Exit node";

        case "gateway":
            return "Gateway";

        default:
            return "Неизвестно";
    }
}


function formatBytes(
    value:
        | number
        | null,
): string {
    if (
        value === null
    ) {
        return "Нет данных";
    }

    const gigabytes =
        value /
        1024 /
        1024 /
        1024;

    if (
        gigabytes >= 1
    ) {
        return `${gigabytes.toFixed(2)} GB`;
    }

    const megabytes =
        value /
        1024 /
        1024;

    return `${megabytes.toFixed(0)} MB`;
}


function formatMemoryUsage(
    used:
        | number
        | null,

    total:
        | number
        | null,
): string {
    if (
        used === null ||
        total === null ||
        total === 0
    ) {
        return "Нет данных";
    }

    const percentage =
        used /
        total *
        100;

    return `${percentage.toFixed(1)}%`;
}


function formatUptime(
    seconds:
        | number
        | null,
): string {
    if (
        seconds === null
    ) {
        return "Нет данных";
    }

    const days =
        Math.floor(
            seconds / 86400,
        );

    const hours =
        Math.floor(
            (
                seconds % 86400
            ) / 3600,
        );

    const minutes =
        Math.floor(
            (
                seconds % 3600
            ) / 60,
        );


    if (
        days > 0
    ) {
        return `${days} д. ${hours} ч.`;
    }

    if (
        hours > 0
    ) {
        return `${hours} ч. ${minutes} мин.`;
    }

    return `${minutes} мин.`;
}


export default NodeDetailsContent;