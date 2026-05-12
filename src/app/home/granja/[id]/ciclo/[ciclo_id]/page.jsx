"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Calendar, CalendarX, Fish, ClipboardList, Map } from "lucide-react";
import { Batches } from '@/app/components/batches';

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

export default function Ciclo({ params }) {
    const { ciclo_id, id } = useParams(params);
    const [ciclo, setCiclo] = useState(null);

    const [species, setSpecies] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem("access");
                
                const resCiclo = await fetch(`https://backend-pongase-trucha.onrender.com/api/farms/${id}/cycles/${ciclo_id}/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                });

                if (!resCiclo.ok) {
                    const errorData = await resCiclo.clone().json().catch(() => ({}));
                    throw new Error(errorData.detail || errorData.message || `Error ${resCiclo.status} al obtener la informacion del ciclo`);
                }

                const data = await resCiclo.json();
                setCiclo(data);

                const resSpecies = await fetch(`https://backend-pongase-trucha.onrender.com/api/species/`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (resSpecies.ok) {
                    const dataSpecies = await resSpecies.json();
                    setSpecies(Array.isArray(dataSpecies) ? dataSpecies : []);
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchData();
    }, [id, ciclo_id]);

    return (
        <div className="min-h-screen bg-slate-50">
            {
                !ciclo && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                        <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center">
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                            <p className="mt-4 font-medium text-slate-700">Cargando información del ciclo...</p>
                        </div>
                    </div>
                )
            }
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                <a
                    href={`/home/granja/${id}/`}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver a la Vista de la Granja
                </a>
            </div>

            {ciclo && (
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-6 space-y-6">
                        <div className="flex justify-between items-start">
                            <h1 className="text-4xl font-bold">
                                {ciclo.name}
                            </h1>
                            <div className={`px-4 py-2 rounded-lg font-bold ${STATE_COLORS[ciclo.state] || "bg-gray-100 text-gray-700"}`}>
                                {STATE_LABELS[ciclo.state] || ciclo.state}
                            </div>
                        </div>

                        {ciclo.description?.length > 0 && (
                            <p className="text-xl text-slate-700">{ciclo.description}</p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xl">
                            <div className="bg-slate-50 p-4 rounded-lg flex flex-col gap-2">
                                <span className="text-slate-600 flex items-center gap-2">
                                    <Calendar className="w-5 h-5" /> Fecha de Inicio
                                </span>
                                <span className="font-bold">{ciclo.start_date || "No especificada"}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg flex flex-col gap-2">
                                <span className="text-slate-600 flex items-center gap-2">
                                    <CalendarX className="w-5 h-5" /> Fin Estimado
                                </span>
                                <span className="font-bold">{ciclo.estimated_finish_date || "No especificada"}</span>
                            </div>
                            {ciclo.finish_date && (
                                <div className="bg-slate-50 p-4 rounded-lg flex flex-col gap-2">
                                    <span className="text-slate-600 flex items-center gap-2">
                                        <CalendarX className="w-5 h-5" /> Fecha Finalización
                                    </span>
                                    <span className="font-bold">{ciclo.finish_date}</span>
                                </div>
                            )}
                            
                            {ciclo.specie && (
                                <div className="bg-slate-50 p-4 rounded-lg flex flex-col gap-2">
                                    <span className="text-slate-600 flex items-center gap-2">
                                        <Fish className="w-5 h-5" /> Especie
                                    </span>
                                    <span className="font-bold">
                                        {species.find(s => s.id === ciclo.specie)?.name || `Especie #${ciclo.specie}`}
                                    </span>
                                </div>
                            )}
                            {ciclo.production_plan && (
                                <div className="bg-slate-50 p-4 rounded-lg flex flex-col gap-2">
                                    <span className="text-slate-600 flex items-center gap-2">
                                        <ClipboardList className="w-5 h-5" /> Plan de Producción
                                    </span>
                                    <span className="font-bold">Plan #{ciclo.production_plan}</span>
                                </div>
                            )}
                            {ciclo.pond && (
                                <div className="bg-slate-50 p-4 rounded-lg flex flex-col gap-2">
                                    <span className="text-slate-600 flex items-center gap-2">
                                        <Map className="w-5 h-5" /> Estanque
                                    </span>
                                    <span className="font-bold">
                                        {typeof ciclo.pond === 'object' ? ciclo.pond.name : `Estanque #${ciclo.pond}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className="font-bold text-3xl mb-2">Lotes del Ciclo</h2>
                    <p className="text-xl text-slate-600 mb-6">Listado de lotes asociados a este ciclo.</p>
                </div>
            </div>
            
            <div className="mt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-12">
                <Batches id={id} cycleId={ciclo_id} />
            </div>
        </div>
    );
}
