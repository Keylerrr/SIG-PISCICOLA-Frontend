"use client"

import { useEffect, useState } from "react";
import { Droplet, RulerDimensionLine, Pencil, Trash, Activity } from 'lucide-react'
import Link from "next/link";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
} from "@/components/ui/alert-dialog"
import { Toaster, toast } from "sonner"
import { PondRegisterForm } from "./pond_form";

export function Ponds({ id, search, filter }) {
    const [estanques, setEstanques] = useState([])
    const [disabledPonds, setDisabledPonds] = useState({})
    const filteredEstanques = estanques.filter((e) =>
        e.name.toLowerCase().includes((search || "").toLowerCase().trim())
    );

    const togglePondDisabled = (pondId) => {
        setDisabledPonds(prev => ({
            ...prev,
            [pondId]: !prev[pondId]
        }));
    };
    const statusStyles = {
        active: "bg-green-100 text-green-700",
        inactive: "bg-red-100 text-red-700",
        in_use: "bg-blue-100 text-blue-700",
        cleaning: "bg-yellow-100 text-yellow-700",
    };
    const statusLabels = {
        active: "Activo",
        inactive: "Inactivo",
        in_use: "En Uso",
        cleaning: "En Limpieza",
    };

    useEffect(() => {
        async function fetchEstanques() {
            try {
                const token = localStorage.getItem("access")
                const res = await fetch(`https://backend-pongase-trucha.onrender.com/api/farms/${id}/ponds/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                })

                if (!res.ok) {
                    const errorData = await res.clone().json().catch(() => ({}));
                    throw new Error(errorData.detail || errorData.message || `Error ${res.status} al obtener estanques`);
                }
                
                const data = await res.json();
                if (filter && filter !== "all") {
                    setEstanques(data.filter(pond => pond.status === filter));
                } else {
                    setEstanques(data);
                }
            } catch (error) {
                console.error(error)
            }
        }
        fetchEstanques();
    }, [id, filter]);

    const handleDelete = async (ide) => {
        const token = localStorage.getItem("access");
        await toast.promise(
            fetch(`https://backend-pongase-trucha.onrender.com/api/farms/${id}/ponds/${ide}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }).then(async (res) => {
                let data = null;
                try {
                    data = await res.json();
                } catch { }

                if (!res.ok) {
                    const errorMsg = data?.detail || data?.message || data?.non_field_errors?.[0] || `Error ${res.status} al eliminar`;
                    throw new Error(errorMsg);
                }

                return data;
            }),
            {
                loading: "Eliminando estanque...",
                success: (data) => {
                    setEstanques(prev => prev.filter(e => e.id !== ide));
                    return data?.message || "Estanque eliminada correctamente";
                },
                error: (err) => err.message || "Error al eliminar estanque",
            }
        );
    }

    return (
        <>
            <Toaster position="top-center" />
            <div className="max-w-6xl mx-auto grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 p-4">
                {filteredEstanques.length === 0 && search.trim() && (
                    <p className="text-center col-span-full text-gray-500 text-lg">
                        No se encontraron estanques 😢
                    </p>
                )}
                {filteredEstanques.map((e) => (
                    <div key={e.id}>
                        <Card className={`group border border-gray-200 hover:border-blue-500 hover:shadow-lg ${disabledPonds[e.id] ? "bg-gray-200" : ""} hover:-translate-y-1 transition-all duration-200`}>
                            <CardHeader>
                                <CardTitle className="font-bold text-2xl group-hover:text-blue-600">
                                    <Link href={`/home/granja/${id}/estanque/${e.id}/`}>
                                        {e.name}
                                    </Link>
                                </CardTitle>
                                <CardDescription className="gap-2 font-bold text-lg flex items-center">Código: {e.code}</CardDescription>
                                <CardAction>
                                    <div className="flex items-center gap-3">
                                        <AlertDialog>
                                            {!disabledPonds[e.id] && (
                                                <AlertDialogTrigger asChild>
                                                    <Pencil className={`cursor-pointer ${disabledPonds[e.id] ? "text-gray-400 cursor-not-allowed" : "text-blue-600"}`} />
                                                </AlertDialogTrigger>)}


                                            <AlertDialogContent className="sm:max-w-2xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        ¿Editar estanque?
                                                    </AlertDialogTitle>

                                                    <AlertDialogDescription>
                                                        Cambie los datos a continuación para editar la informacio del estanque{" "}
                                                        <span className="font-bold">{e.name}</span>.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <PondRegisterForm
                                                    op={0}
                                                    idProp={e.id}
                                                    idFarmProp={id}
                                                    nombreProp={e.name}
                                                    estadoProp={e.status}
                                                    capacidadProp={e.capacity}
                                                    areaProp={e.area}
                                                    volumenProp={e.volume}
                                                    profundidadProp={e.depth}
                                                    descripcionProp={e.description}
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

                                            <AlertDialogContent className="sm:max-w-2xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        ¿Eliminar estanque?
                                                    </AlertDialogTitle>

                                                    <AlertDialogDescription>
                                                        Esta acción no se puede deshacer. Se eliminará el estanque: {" "}
                                                        <span className="font-bold">{e.name}</span>.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancelar
                                                    </AlertDialogCancel>

                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(e.id)}
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
                            <CardContent className="text-lg font-bold">
                                <p className="flex gap-2"><Droplet /> Volumen: <span className="text-blue-500">{e.volume} m³</span></p>
                                <p className="flex gap-2"><RulerDimensionLine /> Área: <span className="text-blue-500">{e.area} m²</span></p>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between gap-4">
                                <p className={`whitespace-nowrap capitalize px-3 py-1 rounded-full text-sm font-semibold
                                        ${statusStyles[e.status] || "bg-gray-100 text-gray-700"}`}>
                                    {statusLabels[e.status]}
                                </p>
                                <div className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${disabledPonds[e.id] ? "bg-red-500" : "bg-green-500"} cursor-pointer`} onClick={() => togglePondDisabled(e.id)}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${disabledPonds[e.id] ? "translate-x-6" : "translate-x-1"}`} />
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>
        </>
    );
}