"use client";

import { useEffect, useState } from "react";
import { MapPin, Pencil, Trash } from "lucide-react";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FarmRegisterForm } from "./farm_form";
import { Toaster, toast } from "sonner";

async function refreshAccessToken() {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return null;

    try {
        const res = await fetch("https://backend-pongase-trucha.onrender.com/api/auth/token/refresh/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });

        if (!res.ok) return null;

        const data = await res.json();
        localStorage.setItem("access", data.access);
        if (data.refresh) localStorage.setItem("refresh", data.refresh);
        return data.access;
    } catch {
        return null;
    }
}

export function Farms({ search = "" }) {
    const [granjas, setGranjas] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [ciudades, setCiudades] = useState([]);

    const filteredGranjas = granjas.filter((g) =>
        g.name.toLowerCase().includes(search.toLowerCase().trim())
    );

    useEffect(() => {
        async function fetchGranja() {
            try {
                let token = localStorage.getItem("access");

                const res = await fetch(
                    "https://backend-pongase-trucha.onrender.com/api/farms/",
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                    }
                );

                if (res.status === 401) {
                    const newToken = await refreshAccessToken();
                    if (!newToken) throw new Error("Sesión expirada. Inicia sesión nuevamente.");

                    const retryRes = await fetch(
                        "https://backend-pongase-trucha.onrender.com/api/farms/",
                        {
                            headers: {
                                "Authorization": `Bearer ${newToken}`,
                            },
                        }
                    );

                    if (!retryRes.ok) {
                        const errorData = await retryRes.clone().json().catch(() => ({}));
                        throw new Error(errorData.detail || errorData.message || `Error ${retryRes.status}`);
                    }

                    const data = await retryRes.json();
                    setGranjas(data);
                    return;
                }

                if (!res.ok) {
                    const errorData = await res.clone().json().catch(() => ({}));
                    throw new Error(errorData.detail || errorData.message || `Error ${res.status}: ${res.statusText}`);
                }

                const data = await res.json();
                setGranjas(data);
            } catch (error) {
                console.error(error);
                if (error.message === "Sesión expirada. Inicia sesión nuevamente.") {
                    toast.error("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
                }
            }
        }

        fetchGranja();
    }, []);

    useEffect(() => {
        fetch("https://backend-pongase-trucha.onrender.com/api/departments/")
            .then((res) => {
                if (!res.ok) throw new Error("Error al traer departamentos");
                return res.json();
            })
            .then((data) => {
                setDepartamentos(data);
            })
            .catch((err) => console.error(err));
    }, []);

            useEffect(() => {
                fetch("https://backend-pongase-trucha.onrender.com/api/cities/")
                    .then((res) => {
                        if (!res.ok) throw new Error("Error al traer ciudades");
                        return res.json();
                    })
                    .then((data) => {
                        setCiudades(data);
                    })
                    .catch((err) => console.error(err));
            }, []);

const handleDelete = async (id) => {
    const token = localStorage.getItem("access");

    await toast.promise(
        (async () => {
            const res = await fetch(
                `https://backend-pongase-trucha.onrender.com/api/farms/${id}/`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                const errorData = await res.clone().json().catch(() => ({}));
                throw new Error(
                    errorData.detail || 
                    errorData.message || 
                    `Error ${res.status}: ${res.statusText}`
                );
            }

            return { message: "Granja eliminada correctamente" };
        })(),
        {
            loading: "Eliminando granja...",
            success: (data) => {
                setGranjas((prev) => prev.filter((g) => g.id !== id));
                return data?.message || "Granja eliminada correctamente";
            },
            error: (err) => {
                if (err.message.includes("token") || err.message.includes("401")) {
                    return "Tu sesión ha expirado. Recarga la página.";
                }
                return err.message || "Error al eliminar granja";
            },
        }
    );
};

    return (
        <>
            <Toaster position="top-center" />

            <div className="max-w-6xl mx-auto grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 p-4">
                {filteredGranjas.length === 0 && search && (
                    <p className="text-center col-span-full text-gray-500 text-lg">
                        No se encontraron granjas 😢
                    </p>
                )}

                {filteredGranjas.map((g) => {
                    const departamento = departamentos.find(
                        (d) => d.id === g.department
                    );

                    return (
                        <div key={g.id}>
                            <Card className="group border hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold group-hover:text-blue-600">
                                        <a href={`/home/granja/${g.id}/`}>
                                            {g.name}
                                        </a>
                                    </CardTitle>

                                    <CardDescription className="flex items-center gap-2 font-bold">
                                        <MapPin />
                                        {departamento?.name || "—"} - {ciudades.find(c => c.id === g.city)?.name || "—"}
                                    </CardDescription>

                                    <CardAction>
                                        <div className="flex gap-3">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Pencil className="text-blue-600 cursor-pointer" />
                                                </AlertDialogTrigger>

                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            ¿Editar granja?
                                                        </AlertDialogTitle>

                                                        <AlertDialogDescription>
                                                            Edita{" "}
                                                            <span className="font-bold">
                                                                {g.name}
                                                            </span>
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>

                                                    <FarmRegisterForm
                                                        op={0}
                                                        idProp={g.id}
                                                        nombreProp={g.name}
                                                        departamentoProp={g.department}
                                                        ciudadProp={g.city}
                                                        direccionProp={g.address}
                                                        areaProp={g.total_area_ha}
                                                    />

                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Cancelar
                                                        </AlertDialogCancel>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Trash className="text-red-600 cursor-pointer" />
                                                </AlertDialogTrigger>

                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            ¿Eliminar granja?
                                                        </AlertDialogTitle>

                                                        <AlertDialogDescription>
                                                            Se eliminará{" "}
                                                            <span className="font-bold">
                                                                {g.name}
                                                            </span>
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>

                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Cancelar
                                                        </AlertDialogCancel>

                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                handleDelete(g.id)
                                                            }
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardAction>
                                </CardHeader>

                                <CardFooter>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {g.total_area_ha} ha
                                        </p>
                                        <p className="text-md text-slate-500">
                                            Área Total
                                        </p>
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </>
    );
}