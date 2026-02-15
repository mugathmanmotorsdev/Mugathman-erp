import { thumbs } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { useMemo } from "react";


export const useAvatar = (id: string, scale: number) => {
    const avatar = useMemo(() => {
        return createAvatar(thumbs, {
            seed: id,
            scale: scale,
            backgroundColor: ["69d2e7"],
        }).toDataUri();
    }, [id, scale]);

    return avatar
}