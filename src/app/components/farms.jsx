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

export function Farms() {
    const [granjas, SetGranjas] = useState([]);

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

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 p-4">
            {granjas.map((g) => (
                <div key={g.id}>
                    <Card className="group border border-gray-200 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                        <CardHeader>
                            <CardTitle className="font-bold text-2xl group-hover:text-blue-600">{g.name}</CardTitle>
                            <CardDescription className="gap-2 font-bold text-md flex items-center">
                                <MapPin /> {g.department} - {g.city}
                            </CardDescription>
                            <CardAction className="flex gap-3">
                                <Pencil className="text-blue-600 cursor-pointer"/>
                                <Trash className="text-red-600 cursor-pointer"/>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="flex gap-2 text-xl">
                            <UserRound/> {g.manager_name}
                        </CardContent>
                        <CardFooter className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{g.total_area_ha} m²</p>
                                <p className="text-md text-slate-500">Area Total</p>
                            </div>
                            <div className="flex items-center gap-2 text-green-500">
                                <Activity /> Activo
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            ))}
        </div>
    );
};
