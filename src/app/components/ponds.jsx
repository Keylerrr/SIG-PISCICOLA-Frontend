"use client"

import { use, useEffect, useState } from "react";
import { Droplet, RulerDimensionLine, Pencil, Trash } from 'lucide-react'
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

export function Ponds({ id, search, filter }) {
    const [estanques, setEstanques] = useState([])
    const filteredEstanques = estanques.filter((e) =>
        e.name.toLowerCase().includes((search || "").toLowerCase().trim())
    );
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
        console.log(id);
        async function fetchEstanques() {
            try {
                const token = localStorage.getItem("access")
                const res = await fetch(`https://backend-pongase-trucha.onrender.com/ponds/?farm_id=${id}&status=${filter}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                })

                if (!res.ok) throw new Error("Error al obtener los estanques")
                const data = await res.json();
                setEstanques(data);
            } catch (error) {
                console.error(error)
            }
        }
        fetchEstanques();
    }, [filter]);

    const handleDelete = async (ide) => {
        const token = localStorage.getItem("access");
        await toast.promise(
            fetch(`https://backend-pongase-trucha.onrender.com/ponds/${ide}/`, {
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
                    throw new Error(data?.message || "Error al eliminar estanque");
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
                        <Card className="group border border-gray-200 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                            <CardHeader>
                                <CardTitle className="font-bold text-2xl group-hover:text-blue-600">
                                    {e.name}
                                </CardTitle>
                                <CardDescription className="gap-2 font-bold text-lg flex items-center gap-2">Código: {e.code}</CardDescription>
                                <CardAction>
                                    <div className="flex items-center gap-3">
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
                                                        Cambie los datos a continuación para editar la informacio de la granja{" "}
                                                        <span className="font-bold">{ }.</span>
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                {/* <FarmRegisterForm
                                                    op={0}
                                                    idProp={g.id}
                                                    nombreProp={g.name}
                                                    departamentoProp={g.department}
                                                    ciudadProp={g.city}
                                                    direccionProp={g.address}
                                                    areaProp={g.total_area_ha}
                                                    managerProp={g.manager_id}
                                                /> */}
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
                            <CardFooter>
                                <p className={`capitalize px-3 py-1 rounded-full text-sm font-semibold
                                        ${statusStyles[e.status] || "bg-gray-100 text-gray-700"}`}>
                                    {statusLabels[e.status]}
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>
        </>
    );
}