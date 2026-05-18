"use client";

import { useEffect, useState, useMemo } from "react";
import { Calendar, Pencil, Trash, CalendarX } from "lucide-react";
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
import { Toaster, toast } from "sonner";
import Link from "next/link";
import { CycleRegisterForm } from "./cycle_form";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown } from "lucide-react";

const API_BASE = "https://backend-pongase-trucha.onrender.com/api";

const STATE_LABELS = {
    in_progress: "En Ejecución",
    paused: "Pausado",
    finished: "Completado",
    cancelled: "Cancelado",
};

const STATE_COLORS = {
    in_progress: "bg-blue-100 text-blue-700",
    paused: "bg-yellow-100 text-yellow-700",
    finished: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

export function Cycles({ id, search = "" }) {
    const [ciclos, setCiclos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [species, setSpecies] = useState([]);
    const [selectedSpecie, setSelectedSpecie] = useState("all");
    const [ordering, setOrdering] = useState("");

    const filteredCiclos = useMemo(() => {
        if (!search?.trim()) return ciclos;
        const term = search.toLowerCase().trim();
        return ciclos.filter((c) => c.name?.toLowerCase().includes(term));
    }, [ciclos, search]);

    useEffect(() => {
        const fetchSpecies = async () => {
            try {
                const token = localStorage.getItem("access");
                const res = await fetch(`${API_BASE}/species/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setSpecies(data);
                }
            } catch (err) {
                console.error("Error fetching species:", err);
            }
        };
        fetchSpecies();
    }, []);

    useEffect(() => {
        const fetchCiclos = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("access");
                let url = `${API_BASE}/farms/${id}/cycles/`;
                const params = new URLSearchParams();
                
                if (selectedSpecie && selectedSpecie !== "all") {
                    params.append("specie_id", selectedSpecie);
                }
                if (ordering) {
                    params.append("ordering", ordering);
                }
                
                const queryString = params.toString();
                if (queryString) {
                    url += `?${queryString}`;
                }

                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error(`Error ${res.status} al obtener ciclos`);
                }

                const data = await res.json();
                setCiclos(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error cargando ciclos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCiclos();
    }, [id, selectedSpecie, ordering]);

    const handleDelete = async (cycleId) => {
        const token = localStorage.getItem("access");

        toast.promise(
            fetch(`${API_BASE}/farms/${id}/cycles/${cycleId}/`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            }).then(async (res) => {
                if (!res.ok) {
                    throw new Error(`Error ${res.status} al eliminar el ciclo`);
                }
                setCiclos((prev) => prev.filter((c) => c.id !== cycleId));
            }),
            {
                loading: "Eliminando ciclo...",
                success: "Ciclo eliminado correctamente",
                error: "Error al eliminar el ciclo",
            }
        );
    };

    return (
        <>
            <Toaster position="top-center" />

            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 px-4 pt-4 items-center justify-between">
                <div className="flex gap-2 items-center w-full sm:w-auto">
                    <Select value={selectedSpecie} onValueChange={setSelectedSpecie}>
                        <SelectTrigger className="w-[200px] bg-white border-slate-300">
                            <SelectValue placeholder="Todas las especies" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las especies</SelectItem>
                            {species.map(s => (
                                <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2 items-center">
                    <Button 
                        variant={ordering === "asc" ? "default" : "outline"} 
                        onClick={() => setOrdering(ordering === "asc" ? "" : "asc")}
                        title="Orden ascendente"
                        className={ordering === "asc" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-slate-700"}
                    >
                        <ArrowUp className="w-4 h-4 mr-2" /> Asc
                    </Button>
                    <Button 
                        variant={ordering === "desc" ? "default" : "outline"} 
                        onClick={() => setOrdering(ordering === "desc" ? "" : "desc")}
                        title="Orden descendente"
                        className={ordering === "desc" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white text-slate-700"}
                    >
                        <ArrowDown className="w-4 h-4 mr-2" /> Desc
                    </Button>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center min-h-50 mt-8">
                    <p className="text-slate-500">Cargando ciclos...</p>
                </div>
            )}

            <div className="max-w-6xl mx-auto grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 p-4">
                {filteredCiclos.length === 0 && search && (
                    <p className="text-center col-span-full text-gray-500 text-lg">
                        No se encontraron ciclos 😢
                    </p>
                )}

                {filteredCiclos.map((c) => (
                    <Card
                        key={c.id}
                        className="group border hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all"
                    >
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold group-hover:text-blue-600">
                                <Link href={`/home/granja/${id}/ciclo/${c.id}/`}>{c.name}</Link>
                            </CardTitle>

                            <CardDescription className="flex items-center gap-2 font-bold">
                                <Calendar className="w-4 h-4" />
                                Inicio: {c.start_date || "—"}
                            </CardDescription>

                            <CardDescription className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                <CalendarX className="w-4 h-4" /> Fin est.: {c.estimated_finish_date || "—"}
                            </CardDescription>

                            <CardAction>
                                <div className="flex gap-3">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Pencil className="text-blue-600 cursor-pointer hover:text-blue-700 transition-colors" />
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="w-[95vw] max-w-2xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Editar ciclo?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Edita <span className="font-bold">{c.name}</span>
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <CycleRegisterForm
                                                op={2}
                                                idProp={c.id}
                                                farmProp={c.farm || id}
                                                specieProp={c.specie}
                                                productionPlanProp={c.production_plan}
                                                nameProp={c.name}
                                                startDateProp={c.start_date}
                                                estimatedFinishDateProp={c.estimated_finish_date}
                                                stateProp={c.state}
                                                commentsProp={c.comments}
                                                minWeightGProp={c.min_weight_g}
                                                avgWeightGProp={c.avg_weight_g}
                                                maxWeightGProp={c.max_weight_g}
                                            />
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cerrar</AlertDialogCancel>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Trash className="text-red-600 cursor-pointer hover:text-red-700 transition-colors" />
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="w-[95vw] max-w-md">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Eliminar ciclo?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Se eliminará <span className="font-bold">{c.name}</span>
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(c.id)}
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

                        {c.comments && (
                            <CardContent className="text-sm text-slate-500 italic pb-2">
                                {`"${c.comments}"`}
                            </CardContent>
                        )}

                        <CardFooter>
                            <div className="w-full flex justify-between items-center">
                                <p
                                    className={`capitalize px-3 py-1 rounded-full text-sm font-semibold ${STATE_COLORS[c.state] || "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {STATE_LABELS[c.state] || c.state}
                                </p>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>
    );
}
