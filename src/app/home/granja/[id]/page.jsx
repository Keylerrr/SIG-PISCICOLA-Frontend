"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react";
import { Ponds } from "@/app/components/ponds";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
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

export default function Granja({ params }) {
    const { id } = use(params);
    const [granja, setGranja] = useState([]);
    const [departamentos, setDepartmentos] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("access")

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
            {
                granja.length === 0 && departamentos.length === 0 && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                        <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center">
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                            <p className="mt-4 font-medium text-slate-700">Cargando estanques...</p>
                        </div>
                    </div>
                )
            }
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
                            Departamento <br />
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
                <div className="max-w-5xl mx-auto flex justify-between">
                    <div>
                        <h1 className="font-bold text-3xl">Estanques</h1>
                        <p className="text-xl">Selecciona un estanque para ver especies y calidad del agua</p>
                    </div>
                    <div>
                        <Dialog>
                            <form>
                                <DialogTrigger asChild>
                                    <Button className="text-xl flex items-center gap-2 text-white rounded-xl bg-blue-600 px-4 py-5"
                                        variant="outline">
                                        <Plus />
                                        Agregar Estanque
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Agregar Estanque</DialogTitle>
                                        <DialogDescription>
                                            Escribe la información del estanque que vas a agregar. Haz click en crear cuando hayas terminado.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <PondRegisterForm
                                        op={1}
                                        idProp={""}
                                        idFarmProp={id}
                                        nombreProp={""}
                                        capacidadProp={""}
                                        areaProp={""}
                                        volumenProp={""}
                                        profundidadProp={""}
                                        descripcionProp={""}
                                    />
                                </DialogContent>
                            </form>
                        </Dialog>
                    </div>
                </div>
            </div>
            <div className="mt-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between">
                    <div className="w-full sm:flex-1">
                        <Field className="text-xl">
                            <FieldLabel htmlFor="input-button-group" className="text-xl">
                                Buscar
                            </FieldLabel>
                            <ButtonGroup>
                                <Input
                                    id="input-button-group"
                                    placeholder="Escriba el nombre del estanque..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <Button className="text-md">Search</Button>
                            </ButtonGroup>
                        </Field>
                    </div>
                    <div className="w-full sm:w-50">
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filtrar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="active">Activo</SelectItem>
                                    <SelectItem value="inactive">Inactivo</SelectItem>
                                    <SelectItem value="cleaning">En Limpieza</SelectItem>
                                    <SelectItem value="in_use">En Uso</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                </div>
            </div>
            <div className="mt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <Ponds id={id} search={search} filter={filter}/>
            </div>
        </div>
    );
}
