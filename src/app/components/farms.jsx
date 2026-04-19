"use client";

import { useEffect, useState } from "react";
import { MapPin, Activity, Pencil, Trash, UserRound } from 'lucide-react';
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
import { FarmRegisterForm } from "./farm_form";
import { Toaster, toast } from "sonner"

export function Farms({ search }) {
    const [granjas, SetGranjas] = useState([]);
    const filteredGranjas = granjas.filter((g) =>
        g.name.toLowerCase().includes((search || "").toLowerCase().trim())
    );

    useEffect(() => {
        async function fetchGranja() {
            try {
                const token = localStorage.getItem("access")
                console.log("TOKEN:", token)

                const res = await fetch("https://backend-pongase-trucha.onrender.com/farm/", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                })

                if (!res.ok) throw new Error("Error al obtener la informacion de las granajas")

                const data = await res.json();
                SetGranjas(data);
            } catch (error) {
                console.error(error)
            }
        }
        fetchGranja();
    }, []);

    const [departamentos, setDepartmentos] = useState([]);
    useEffect(() => {
        const token = localStorage.getItem("access")
        //DEPARTAMENTOS
        fetch("https://backend-pongase-trucha.onrender.com/farm/departments/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        }).then((res) => {
            if (!res.ok) throw new Error("Error al traer departamentos");
            return res.json();
        }).then((data) => {
            setDepartmentos(data.departments);
            console.log(data)
        }).catch((err) => console.error(err));
    }, []);

    const handleDelete = async (id) => {
        const token = localStorage.getItem("access");
        await toast.promise(
            fetch(`https://backend-pongase-trucha.onrender.com/farm/${id}/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(),
            }).then(async (res) => {
                let data = null;
                try {
                    data = await res.json();
                } catch { }

                if (!res.ok) {
                    throw new Error(data?.message || "Error al eliminar granja");
                }

                return data;
            }),
            {
                loading: "Eliminando granja...",
                success: (data) => {
                    SetGranjas(prev => prev.filter(g => g.id !== id));
                    return data?.message || "Granja eliminada correctamente";
                },
                error: (err) => err.message || "Error al eliminar granja",
            }
        );
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 p-4">
                {filteredGranjas.length === 0 && search.trim() && (
                    <p className="text-center col-span-full text-gray-500 text-lg">

                    </p>
                )}
                {filteredGranjas.map((g) => (
                    <div key={g.id}>
                        <Card className="group border border-gray-200 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                            <CardHeader>
                                <CardTitle className="font-bold text-2xl group-hover:text-blue-600">
                                    <a href={`/home/granja/${g.id}/`}>{g.name}</a>
                                </CardTitle>

                                <CardDescription className="gap-2 font-bold text-md flex items-center">
                                    <MapPin /> {departamentos.find(d => d.key === g.department)?.label} - {g.city}
                                </CardDescription>

                                <CardAction>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Pencil className="text-blue-600 cursor-pointer" />
                                        </AlertDialogTrigger>

                                        <AlertDialogContent className="sm:max-w-2xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    ¿Editar granja?
                                                </AlertDialogTitle>

                                                <AlertDialogDescription>
                                                    Cambie los datos a continuación para editar la informacio de la granja {" "}
                                                    <span className="font-bold">{g.name}.</span>
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
                                                managerProp={g.manager_id}
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
                                                    ¿Eliminar granja?
                                                </AlertDialogTitle>

                                                <AlertDialogDescription>
                                                    Esta acción no se puede deshacer. Se eliminará la granja{" "}
                                                    <span className="font-bold">{g.name}</span>.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>

                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancelar
                                                </AlertDialogCancel>

                                                <AlertDialogAction
                                                    onClick={() => handleDelete(g.id)}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Eliminar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardAction>
                            </CardHeader>

                            <CardContent className="flex gap-2 text-xl">
                                <UserRound /> {g.manager_name}
                            </CardContent>

                            <CardFooter className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {g.total_area_ha} ha
                                    </p>
                                    <p className="text-md text-slate-500">
                                        Area Total
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-green-500">
                                    <Activity /> Activo
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>
        </>
    );
};
