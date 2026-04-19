"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react";

export default function Granja({ params }) {
    const { id } = use(params);
    const [granja, setGranja] = useState([]);
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

    useEffect(() => {
        const token = localStorage.getItem("access")

        fetch(`https://backend-pongase-trucha.onrender.com/farm/${id}/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        }).then((res) => {
            if (!res.ok) throw new Error("Error al cargar granja");
            return res.json();
        }).then((data) => {
            setGranja(data);
            console.log(data)
        }).catch((err) => console.error(err));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                <a
                    href={"/home"}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver a la Página de Inicio
                </a>
            </div>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-6 space-y-6">
                    <h1 className="text-4xl font-bold">
                        {granja.name}
                    </h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xl">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            Ubicación <br />
                            <p className="font-bold">
                                {departamentos.find(d => d.key === granja.department)?.label}
                            </p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg">
                            Municipio <br />
                            <p className="font-bold">{granja.city}</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg">
                            Area Total <br />
                            <p className="font-bold">{granja.total_area_ha} ha</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 px-4 sm:px-6 lg:px-8">
                <div className="flex max-w-5xl mx-auto justify-between">
                    <div>
                        <h1 className="font-bold text-2xl">Estanques</h1>
                        <p className="text-lg">Selecciona un estanque para ver especies y calidad del agua</p>
                    </div>
                    <div>
                        <Button className="text-xl flex items-center gap-2 text-white rounded-xl bg-blue-600 px-4 py-2"
                            variant="outline">
                            <Plus />
                            Agregar Granja
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}