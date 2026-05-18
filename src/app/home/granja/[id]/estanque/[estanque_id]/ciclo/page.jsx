"use client";
// Esta ruta existe por compatibilidad de URL pero redirige al estanque
// donde los ciclos están integrados directamente.
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CiclosRedirect() {
    const { id, estanque_id } = useParams();
    const router = useRouter();

    useEffect(() => {
        if (id && estanque_id) {
            router.replace(`/home/granja/${id}/estanque/${estanque_id}/`);
        }
    }, [id, estanque_id, router]);

    return null;
}
