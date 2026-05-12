"use client";

import { useEffect, useState, useMemo } from "react";
import { Scale, Pencil, Trash, MoveRight, Fish, Link } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { BatchRegisterForm } from "./batch_form";
import { AssignPondForm } from "./assign_pond_form";
import { AssignCycleForm } from "./assign_cycle_form";
import { Button } from "@/components/ui/button";

const API_BASE = "https://backend-pongase-trucha.onrender.com/api";

const BIO_STATE_LABELS = {
  alevin: "Alevín",
  rising: "Levante",
  fatting: "Engorde",
  breeding: "Reproducción",
};

const STATUS_LABELS = {
  active: "Activo",
  consumed: "Consumido",
  finished: "Completado",
  dead: "Muerto",
};

const STATUS_COLORS = {
  active: "bg-blue-100 text-blue-700",
  consumed: "bg-yellow-100 text-yellow-700",
  finished: "bg-green-100 text-green-700",
  dead: "bg-red-100 text-red-700",
};

export function Batches({ id, pondId, cycleId, search = "" }) {
  const [batches, setBatches] = useState([]);
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await fetch(`${API_BASE}/species/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSpecies(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching species:", err);
      }
    };
    fetchSpecies();
  }, []);

  const specieMap = useMemo(() => {
    return species.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.name }), {});
  }, [species]);

  const filteredBatches = useMemo(() => {
    // Si no hay búsqueda, mostramos todos
    if (!search?.trim()) return batches;
    
    const term = search.toLowerCase().trim();
    
    return batches.filter((item) => {
      /*
       EXPLICACIÓN DE LA COMPLEJIDAD:
       El backend puede devolvernos dos cosas distintas dependiendo de qué endpoint consumamos:
       1. Si consumimos /batches/, nos devuelve objetos Lote (Batch) directos.
       2. Si consumimos /pond-batches/, nos devuelve objetos de Relación (PondBatch) que 
          tienen el Lote anidado adentro de una propiedad llamada 'batch' (dependiendo de 
          cómo se haya serializado en Django).
          
       Para evitar que la app se rompa o que los atributos salgan como "undefined", 
       hacemos esta comprobación: si 'item' tiene la propiedad 'batch' y es un objeto, 
       significa que es una Relación y sacamos el lote de adentro. Si no, usamos 'item' tal cual.
      */
      const b = typeof item.batch === 'object' && item.batch !== null ? item.batch : item;
      
      return (
        BIO_STATE_LABELS[b.biological_state]?.toLowerCase().includes(term) ||
        STATUS_LABELS[b.status]?.toLowerCase().includes(term) ||
        b.id?.toString().includes(term) ||
        (b.comments || "").toLowerCase().includes(term)
      );
    });
  }, [batches, search]);

  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access");
        let endpoint = `${API_BASE}/farms/${id}/batches/?sin_estanque=true`;
        if (cycleId) {
          endpoint = `${API_BASE}/farms/${id}/cycles/${cycleId}/cycle-batches/`;
        } else if (pondId) {
          endpoint = `${API_BASE}/farms/${id}/batches/?pond=${pondId}`;
        }
          
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          // Extraemos información útil si el servidor nos responde con algún error 4xx o 5xx
          const errorText = await res.text();
          throw new Error(`Error ${res.status} al obtener lotes: ${errorText}`);
        }

        const data = await res.json();
        setBatches(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando lotes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [id]);

  const handleDelete = async (batchId) => {
    toast.info("Funcionalidad de eliminar lote pendiente de implementación");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-50">
        <p className="text-slate-500">Cargando lotes...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 p-4">
        {filteredBatches.length === 0 && search && (
          <p className="text-center col-span-full text-gray-500 text-lg">
            No se encontraron lotes 😢
          </p>
        )}

        {filteredBatches.map((item) => {
          const b = typeof item.batch === 'object' && item.batch !== null ? item.batch : item;
          const displayId = b.id || item.id;
          return (
          <Card
            key={item.id}
            className="group border hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold group-hover:text-blue-600">
                Lote #{displayId}
              </CardTitle>

              <CardDescription className="flex items-center gap-2 font-bold text-lg mt-1">
                <Fish className="w-5 h-5" />
                {specieMap[b.specie] || b.specie} - {BIO_STATE_LABELS[b.biological_state] || b.biological_state}
              </CardDescription>

              <CardAction>
                <div className="flex gap-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Pencil className="text-blue-600 cursor-pointer hover:text-blue-700 transition-colors" />
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[95vw] max-w-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Editar lote #{b.id}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Edita la información del lote
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <BatchRegisterForm
                        op={0}
                        idProp={b.id}
                        idFarmProp={id}
                        specieProp={b.specie?.toString() || b.specie}
                        biologicalStateProp={b.biological_state}
                        statusProp={b.status}
                        initialQuantityProp={b.initial_quantity}
                        minWeightGProp={b.min_weight_g}
                        avgWeightGProp={b.avg_weight_g}
                        maxWeightGProp={b.max_weight_g}
                        commentsProp={b.comments ?? ""}
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cerrar</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Trash className="text-red-600 cursor-pointer hover:text-red-700 transition-colors" />
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[95vw] max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar lote?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Se eliminará el lote #{b.id}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(b.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardAction>
            </CardHeader>
            
            <CardContent className="text-md space-y-2">
              <p><strong>Cant. Inicial:</strong> {b.initial_quantity}</p>
              <div className="flex gap-2 items-center text-sm text-slate-600">
                <Scale className="w-4 h-4" />
                <span>Min: {b.min_weight_g}g</span> | 
                <span>Prom: {b.avg_weight_g}g</span> | 
                <span>Max: {b.max_weight_g}g</span>
              </div>
              {b.comments ? (
                <p className="text-sm text-slate-500">
                  <strong>Comentarios:</strong> {b.comments}
                </p>
              ) : null}
            </CardContent>

            <CardFooter className="flex flex-col gap-4 items-start">
              <div className="w-full flex justify-between items-center">
                <p
                  className={`capitalize px-3 py-1 rounded-full text-sm font-semibold ${
                    STATUS_COLORS[b.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {STATUS_LABELS[b.status] || b.status}
                </p>
              </div>

              {!pondId && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full flex gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                    <MoveRight className="w-4 h-4" />
                    Asignar a Estanque
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Asignar Lote #{b.id} a Estanque</DialogTitle>
                    <DialogDescription>
                      Seleccione el estanque de destino para este lote.
                    </DialogDescription>
                  </DialogHeader>
                  <AssignPondForm 
                    farmId={id}
                    batchId={b.id}
                    defaultQuantity={b.initial_quantity}
                  />
                </DialogContent>
              </Dialog>
              )}
              {!!pondId && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full flex gap-2 border-green-200 text-green-700 hover:bg-green-50">
                    <Link className="w-4 h-4" />
                    Vincular a Ciclo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Vincular Lote #{displayId} a Ciclo</DialogTitle>
                    <DialogDescription>
                      Seleccione el ciclo al que desea añadir este lote. Solo se muestran los ciclos en progreso.
                    </DialogDescription>
                  </DialogHeader>
                  <AssignCycleForm 
                    farmId={id}
                    pondBatchId={item.id}
                    defaultQuantity={item.current_quantity || b.initial_quantity}
                    defaultMinWeight={b.min_weight_g || 0}
                    defaultAvgWeight={b.avg_weight_g || 0}
                    defaultMaxWeight={b.max_weight_g || 0}
                  />
                </DialogContent>
              </Dialog>
              )}
            </CardFooter>
          </Card>
        )})}
      </div>
    </>
  );
}
