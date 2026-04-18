"use client";

import { Plus } from "lucide-react";
import { Farms } from "../components/farms";

export default function Home() {
    return (
        <div className="">
            <div className="max-w-5xl mx-auto flex justify-between items-center py-6 px-4">
                <div>
                    <h1 className="text-4xl font-bold">Granjas Piscícolas</h1>
                    <p className="text-xl">
                        Selecciona una granja para gestionar sus estanques y producción
                    </p>
                </div>

                <button className="text-xl flex items-center gap-2 text-white rounded-xl bg-blue-600 px-4 py-2">
                    <Plus />
                    Nueva granja
                </button>
            </div>

            <div className="max-w-5xl mx-auto">
                <Farms/>
            </div>
        </div>
    );
}