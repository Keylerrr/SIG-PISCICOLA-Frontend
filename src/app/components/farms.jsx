"use client";

import { useEffect, useState } from "react";
import { MapPin, Pencil, Trash, UserRound } from "lucide-react";
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

export function Farms({ search = "" }) {
    const [granjas, setGranjas] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);

    const filteredGranjas = granjas.filter((g) =>
        g.name.toLowerCase().includes(search.toLowerCase().trim())
    );

    // 🔹 FETCH GRANJAS
    useEffect(() => {
        async function fetchGranja() {
            try {
                const token = localStorage.getItem("access");

                const res = await fetch(
                    "https://backend-pongase-trucha.onrender.com/api/farms/",
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                    }
                );

                if (!res.ok) throw new Error("Error al obtener granjas");

                const data = await res.json();
                setGranjas(data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchGranja();
    }, []);

    // 🔹 FETCH DEPARTAMENTOS (SIN TOKEN)
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

    // 🔹 DELETE
    const handleDelete = async (id) => {
        const token = localStorage.getItem("access");

        await toast.promise(
            fetch(
                `https://backend-pongase-trucha.onrender.com/api/farms/${id}/`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            ).then((res) => {
                if (!res.ok) {
                    throw new Error("Error al eliminar granja");
                }
            }),
            {
                loading: "Eliminando granja...",
                success: () => {
                    setGranjas((prev) => prev.filter((g) => g.id !== id));
                    return "Granja eliminada correctamente";
                },
                error: (err) => err.message,
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
                                        {departamento?.name || "—"} - {g.city}
                                    </CardDescription>

                                    <CardAction>
                                        <div className="flex gap-3">
                                            {/* EDIT */}
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

                                            {/* DELETE */}
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