"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function Estanque({ params }) {

    const { estanque_id } = useParams(params);
    const { id } = useParams(params);
    const [estanque, setEstanque] = useState([]);
    const statusBg = {
        active: "bg-green-100",
        inactive: "bg-red-100",
        in_use: "bg-blue-100",
        cleaning: "bg-yellow-100",
    };
    const statusFont = {
        active: "text-green-700",
        inactive: "text-red-700",
        in_use: "text-blue-700",
        cleaning: "text-yellow-700",
    };
    const statusLabels = {
        active: "Activo",
        inactive: "Inactivo",
        in_use: "En Uso",
        cleaning: "En Limpieza",
    };
    const typeLabels = {
        dirt: "Tierra",
        concrete: "Concreto",
        geomembrane: "Geomembrana",
        floating_cage: "Jaula flotante",
        raceway: "Canal",
        round_tank: "Tanque circular",
    };

    useEffect(() => {
        async function fetchEstanque() {

            try {
                const token = localStorage.getItem("access");
                const res = await fetch(`https://backend-pongase-trucha.onrender.com/api/farms/${id}/ponds/${estanque_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                })

                if (!res.ok) {
                    const errorData = await res.clone().json().catch(() => ({}));
                    throw new Error(errorData.detail || errorData.message || `Error ${res.status} al obtener la informacion del estanque`);
                }

                const data = await res.json();
                console.log(data);
                setEstanque(data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchEstanque();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            {
                estanque.length === 0 && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                        <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center">
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                            <p className="mt-4 font-medium text-slate-700">Cargando información...</p>
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
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-6 space-y-6">
                    <div className="flex justify-between items-start">
                        <h1 className="text-4xl font-bold">
                            {estanque.name}
                        </h1>
                    </div>
                    {estanque.description?.length>0 && (<p className="text-xl">{estanque.description}</p>)}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xl">
                        <div className={`p-4 rounded-lg 
                            ${statusBg[estanque.status] || "bg-gray-100 text-gray-700"}`}>                            Estado <br />
                            <p className={` font-bold
                                        ${statusFont[estanque.status]}`}>
                                {statusLabels[estanque.status]}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            Codigo <br />
                            <p className="font-bold">{estanque.code}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            Area <br />
                            <p className="font-bold">{estanque.area} m²</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            Capadidad de peces<br />
                            <p className="font-bold">{estanque.capacity}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            Profundidad <br />
                            <p className="font-bold">{estanque.depth} m</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            Tipo <br />
                            <p className="font-bold">{typeLabels[estanque.type]}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}