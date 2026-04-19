"use client";

import { Plus } from "lucide-react";
import { useState, useRef } from "react";
import { Farms } from "../components/farms";
import { FarmRegisterForm } from "../components/farm_form";
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Home() {
    const [search, setSearch] = useState("");

    return (
        <div className="">
            <div className="max-w-5xl mx-auto flex justify-between items-center py-6 px-4">
                <div>
                    <h1 className="text-4xl font-bold">Granjas Piscícolas</h1>
                    <p className="text-xl">
                        Selecciona una granja para gestionar sus estanques y producción
                    </p>
                </div>
                <Dialog>
                    <form>
                        <DialogTrigger asChild>
                            <Button className="text-xl flex items-center gap-2 text-white rounded-xl bg-blue-600 px-4 py-2"
                                variant="outline">
                                <Plus />
                                Agregar Granja
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Agregar Granja</DialogTitle>
                                <DialogDescription>
                                    Escribe la información de la granja que vas a agregar. Haz click en guardar granja cuando hayas terminado.
                                </DialogDescription>
                            </DialogHeader>
                            <FarmRegisterForm 
                                op={1}
                                idProp={""}
                                nombreProp={""}
                                departamentoProp={""}
                                ciudadProp={""}
                                direccionProp={""}
                                areaProp={""}
                                managerProp={""}
                            />
                        </DialogContent>
                    </form>
                </Dialog>
            </div>


            <Field className="max-w-5xl mx-auto">
                <FieldLabel htmlFor="input-button-group" className="text-xl">Search</FieldLabel>
                <ButtonGroup>
                    <Input
                        id="input-button-group" 
                        placeholder="Type to search..."
                        value ={search}
                        onChange={(e)=>setSearch(e.target.value)}
                        />
                    <Button className="text-md">Search</Button>
                </ButtonGroup>
            </Field>


            <div className="max-w-5xl mx-auto">
                <Farms search={search}/>
            </div>
        </div>
    );
}