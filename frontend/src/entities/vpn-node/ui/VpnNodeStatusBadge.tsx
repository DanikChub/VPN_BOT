import { Badge } from "@/shared/ui";

import type {
    VpnNode,
} from "../model";


interface Props {
    node: VpnNode;
}


export function VpnNodeStatusBadge ({
                                node,
                            }: Props) {

    return (
        <Badge
            variant={
                node.status === "online"
                    ? "success"
                    : "danger"
            }
        >
            {node.status === "online"
                ? "Онлайн"
                : "Оффлайн"
            }
        </Badge>
    );
};


