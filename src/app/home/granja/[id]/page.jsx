"use client";

import {
  hasPermission,
  PERMISSIONS,
} from "@/lib/permissions";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react";
import { Ponds } from "@/app/components/ponds";
import { Cycles } from "@/app/components/cycles";
import { Batches } from "@/app/components/batches";
import { BatchRegisterForm } from "@/app/components/batch_form";
import { CycleRegisterForm } from "@/app/components/cycle_form";
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

export default function Granja({ params }) {
    const { id } = use(params);
    const [granja, setGranja] = useState([]);
    const [departamentos, setDepartmentos] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("");
    const [searchCycle, setSearchCycle] = useState("");
    const [searchBatch, setSearchBatch] = useState("");
    const [ciudades, setCiudades] = useState([]);
    const router = useRouter();
    const [myPermissions, setMyPermissions] = useState([]);
    const [myMember, setMyMember] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        let mounted = true;
        try {
            const userString = localStorage.getItem("user");
            if (userString && mounted) {
                // Se usa Promise.resolve() para hacer la llamada asíncrona y evitar la advertencia de ESLint
                Promise.resolve().then(() => {
                    if (mounted) setUserData(JSON.parse(userString));
                });
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
        }
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("access")

        fetch("https://backend-pongase-trucha.onrender.com/api/departments/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        }).then((res) => {
            if (!res.ok) throw new Error("Error al traer departamentos");
            return res.json();
        }).then((data) => {
            setDepartmentos(data);
            console.log(data)
        }).catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("access")

        fetch(`https://backend-pongase-trucha.onrender.com/api/farms/${id}/`, {
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
    }, [id]);

        useEffect(() => {
            fetch("https://backend-pongase-trucha.onrender.com/api/cities/", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access")}`,
                }
            })
            .then((res) => {
                if (!res.ok) throw new Error("Error al traer ciudades");
                return res.json();
            })
            .then((data) => {
                setCiudades(data);
            })
            .catch((err) => console.error(err));
        }, []);

        useEffect(() => {
            const token = localStorage.getItem("access");
            let userId = null;
            try {
                const userObj = JSON.parse(localStorage.getItem("user"));
                if (userObj) {
                    userId = userObj.id;
                }
            } catch(e) {}

            fetch(
                `https://backend-pongase-trucha.onrender.com/api/farms/${id}/members/`,
                {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                }
            )
                .then((res) => res.json())
                .then((data) => {
                if (Array.isArray(data)) {
                    const me = data.find(
                        (member) => member.user.id === userId
                    );

                    if (me) {
                        setMyMember(me);
                        setMyPermissions(me.permissions || []);
                    }
                }
                });
            }, [id]);

        const isFarmOwner = myMember?.is_owner;
        const isProductor = userData?.role?.name === "Productor" || userData?.role === "Productor" || userData?.role?.name === "productor";
        const isAdmin = userData?.role?.name === "Admin" || userData?.role === "Admin" || userData?.role?.name === "admin";
        
        // El Productor tiene acceso total si es miembro de la finca (lo cual se verifica con myMember) o si se requiere como fallback total. 
        // Según la API: Productor con UserFarm válido se considera con control total.
        const hasFullAccess = isAdmin || (isProductor && myMember != null) || isProductor;

        console.log("Debug page.jsx Permissions:", {
            userData,
            isProductor,
            isAdmin,
            isFarmOwner,
            myMember,
            hasFullAccess,
            myPermissions
        });

        const canManagePonds =
        hasFullAccess ||
        isFarmOwner ||
        hasPermission(
            myPermissions,
            PERMISSIONS.MANAGE_POND
        );

        const canManageCycles =
        hasFullAccess ||
        isFarmOwner ||
        hasPermission(
            myPermissions,
            PERMISSIONS.MANAGE_CYCLE
        );

        const canManageFarm =
        hasFullAccess ||
        isFarmOwner ||
        hasPermission(
            myPermissions,
            PERMISSIONS.MANAGE_FARM
        );

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
                    <div className="flex justify-between items-start">
                        <h1 className="text-4xl font-bold">
                            {granja.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3">
                          {canManageFarm && (
                            <Button
                              onClick={() => router.push(`/home/granja/${id}/granja_trabajadores`)}
                              className="flex items-center gap-2 bg-[#6ec3b1] text-white px-4 py-2 rounded-lg"
                            >
                              <UserCog className="w-5 h-5" />
                              Administrar Trabajadores
                            </Button>
                          )}
                          <Link
                            href={`/home/granja/${id}/alimentacion`}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            Alimentación
                          </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xl">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            Departamento <br />
                            <p className="font-bold">
                                {departamentos.find(d => d.id === granja.department)?.name}                            </p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg">
                            Municipio <br />
                            <p className="font-bold">{ciudades.find(c => c.id === granja.city)?.name || "—"}</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg">
                            Área Total <br />
                            <p className="font-bold">{granja.total_area_ha} ha</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg">
                            Direccion <br />
                            <p className="font-bold">{granja.address}</p>
                        </div>

                        {granja.water_source?.length>0 && (<div className="bg-slate-50 p-4 rounded-lg">
                            Fuente hídrica <br />
                            <p className="font-bold">{granja.water_source}</p>
                        </div>)}
                    </div>
                </div>
            </div>
            <div className="mt-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto flex justify-between">
                    <div>
                        <h1 className="font-bold text-3xl">Estanques</h1>
                        <p className="text-xl">Selecciona un estanque para ver especies y calidad del agua</p>
                    </div>
                    {canManagePonds && (
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
                    )}
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
                                <Button className="text-md">Buscar</Button>
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
                <Ponds id={id} search={search} filter={filter} />
            </div>

            {/* Sección de Ciclos */}
            <div className="mt-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto flex justify-between">
                    <div>
                        <h1 className="font-bold text-3xl">Ciclos</h1>
                        <p className="text-xl">Gestiona los ciclos de producción de la granja</p>
                    </div>
                    {canManageCycles && (
                    <div>
                        <Dialog>
                            <form>
                                <DialogTrigger asChild>
                                    <Button className="text-xl flex items-center gap-2 text-white rounded-xl bg-blue-600 px-4 py-5"
                                        variant="outline">
                                        <Plus />
                                        Agregar Ciclo
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Agregar Ciclo</DialogTitle>
                                        <DialogDescription>
                                            Escribe la información del ciclo que vas a agregar. Haz click en crear cuando hayas terminado.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <CycleRegisterForm
                                        op={1}
                                        idProp={""}
                                        farmProp={id}
                                        specieProp={""}
                                        productionPlanProp={""}
                                        nameProp={""}
                                        startDateProp={""}
                                        estimatedFinishDateProp={""}
                                        stateProp={""}
                                        commentsProp={""}
                                        minWeightGProp={""}
                                        avgWeightGProp={""}
                                        maxWeightGProp={""}
                                    />
                                </DialogContent>
                            </form>
                        </Dialog>
                    </div>
                    )}
                </div>
            </div>
            <div className="mt-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between">
                    <div className="w-full sm:flex-1">
                        <Field className="text-xl">
                            <FieldLabel htmlFor="input-search-cycles" className="text-xl">
                                Buscar Ciclo
                            </FieldLabel>
                            <ButtonGroup>
                                <Input
                                    id="input-search-cycles"
                                    placeholder="Escriba el nombre del ciclo..."
                                    value={searchCycle}
                                    onChange={(e) => setSearchCycle(e.target.value)}
                                />
                                <Button className="text-md">Buscar</Button>
                            </ButtonGroup>
                        </Field>
                    </div>
                </div>
            </div>
            <div className="mt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-12">
                <Cycles id={id} search={searchCycle} />
            </div>

            {/* Sección de Lotes */}
            <div className="mt-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto flex justify-between">
                    <div>
                        <h1 className="font-bold text-3xl">Lotes</h1>
                        <p className="text-xl">Gestiona los lotes de la granja (sin asociar a estanque)</p>
                    </div>
                    {canManagePonds && (
                    <div>
                        <Dialog>
                            <form>
                                <DialogTrigger asChild>
                                    <Button className="text-xl flex items-center gap-2 text-white rounded-xl bg-blue-600 px-4 py-5"
                                        variant="outline">
                                        <Plus />
                                        Crear Lote
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Crear Lote</DialogTitle>
                                        <DialogDescription>
                                            Escribe la información del lote que vas a crear. Haz click en crear cuando hayas terminado.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <BatchRegisterForm
                                        op={1}
                                        idProp={""}
                                        idFarmProp={id}
                                        specieProp={""}
                                        biologicalStateProp={""}
                                        statusProp={""}
                                        initialQuantityProp={""}
                                        minWeightGProp={""}
                                        avgWeightGProp={""}
                                        maxWeightGProp={""}
                                        commentsProp={""}
                                    />
                                </DialogContent>
                            </form>
                        </Dialog>
                    </div>
                    )}
                </div>
            </div>
            <div className="mt-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between">
                    <div className="w-full sm:flex-1">
                        <Field className="text-xl">
                            <FieldLabel htmlFor="input-search-batches" className="text-xl">
                                Buscar Lote
                            </FieldLabel>
                            <ButtonGroup>
                                <Input
                                    id="input-search-batches"
                                    placeholder="Escriba el estado o tipo..."
                                    value={searchBatch}
                                    onChange={(e) => setSearchBatch(e.target.value)}
                                />
                                <Button className="text-md">Buscar</Button>
                            </ButtonGroup>
                        </Field>
                    </div>
                </div>
            </div>
            <div className="mt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-12">
                <Batches id={id} search={searchBatch} />
            </div>
        </div>
    );
}
