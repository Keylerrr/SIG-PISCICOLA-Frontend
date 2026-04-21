"use client";

import { useEffect, useState } from "react";
import { getFlags } from "@/lib/flags";

export function useFlags() {
    const [flags, setFlags] = useState({
        isAdmin: false,
        isManager: false,
        farm: {
            create: false,
            assignManager: false,
            edit: false,
        },
        users: {
            createManager: false,
        }
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("access");

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));

            const user = {
                role: payload.role,
            };

            const computedFlags = getFlags(user);

            setFlags(prev => ({
                ...prev,
                ...computedFlags,
            }));
        } catch (error) {
            console.error("Error leyendo token:", error)
        } finally {
            setLoading(false);
        }
    }, []);

    return { flags, loading };
}