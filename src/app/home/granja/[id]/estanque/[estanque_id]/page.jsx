"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { ArrowLeft, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react";
import { Ponds } from "@/app/components/ponds";
import { Field, FieldLabel } from "@/components/ui/field"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { PondRegisterForm } from "@/app/components/pond_form";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function Estanque({ params }) {

    const { estanque_id } = useParams(params);
    const { id } = useParams(params);
    const [estanque, setEstanque] = useState([]);

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xl">
                        {Object.entries(estanque)
                            .filter(([key]) => !['id', 'name', 'department', 'city', 'address', 'created_at', 'updated_at'].includes(key))
                            .map(([key, value]) => {
                                const labels = {
                                    total_area_ha: "Área Total",
                                    water_source: "Fuente de Agua",
                                    status: "Estado",
                                    capacity: "Capacidad",
                                    area: "Área",
                                    volume: "Volumen",
                                    depth: "Profundidad",
                                    description: "Descripción",
                                    code: "Código"
                                };
                                const label = labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                                let displayValue = value;
                                if (key === 'status') {
                                    const statusLabels = {
                                        active: "Activo",
                                        inactive: "Inactivo",
                                        in_use: "En Uso",
                                        cleaning: "En Limpieza"
                                    };
                                    displayValue = statusLabels[value] || value;
                                }

                                if (key === 'total_area_ha') {
                                    displayValue = `${value} ha`;
                                }

                                return (
                                    <div key={key} className="bg-slate-50 p-4 rounded-lg">
                                        {label} <br />
                                        <p className="font-bold">{displayValue || "—"}</p>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}