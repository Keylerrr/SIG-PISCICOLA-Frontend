"use client"

import { use, useEffect, useState } from "react";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export function Ponds({ id }) {
    const [estanques, setEstanques] = useState([])

    useEffect(() => {
        console.log(id);
        async function fetchEstanques() {
            try {
                const token = localStorage.getItem("access")
                const res = await fetch(`https://backend-pongase-trucha.onrender.com/ponds/?farm_id=${id}`, {
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
    }, []);

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 p-4">
            {estanques.map((e) => {
                <div key={e.id}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Card Title</CardTitle>
                            <CardDescription>Card Description</CardDescription>
                            <CardAction>Card Action</CardAction>
                        </CardHeader>
                        <CardContent>
                            <p>Card Content</p>
                        </CardContent>
                        <CardFooter>
                            <p>Card Footer</p>
                        </CardFooter>
                    </Card>
                </div>
            })

            }
        </div>
    );
}