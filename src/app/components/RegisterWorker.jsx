"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useFlags } from "@/hooks/useFlags";

import { Button } from "@/components/ui/button";
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
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";

export function RegisterWorker() {
  const [workers, setWorkers] = useState([]);

  const { flags, loading } = useFlags();
  const canAssignManager = flags?.users?.assignManager;

  const [correo, setCorreo] = useState("");
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState("");
  
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");

  const [open, setOpen] = useState(false);

  // 🔥 TRAER MANAGERS
  useEffect(() => {
    if (!canAssignManager) return;

    const token = localStorage.getItem("access");
    fetch("https://backend-pongase-trucha.onrender.com/api/users/productor/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al traer productores");
        return res.json();
      })
      .then((data) => setManagers(data))
      .catch(console.error);
  }, [canAssignManager]);

  // 🔥 TRAER GRANJAS
  useEffect(() => {
    if (loading) return;

    const fetchFarms = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;

      try {
        let url = "https://backend-pongase-trucha.onrender.com/api/farms/";

        if (canAssignManager) {
          if (!selectedManager) {
            setFarms([]);
            return;
          }
          url = `https://backend-pongase-trucha.onrender.com/api/farms/productor/${selectedManager}/`;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error("Error al traer granjas");
        
        const data = await res.json();
        setFarms(data);
      } catch (err) {
        console.error("Error cargando granjas:", err);
      }
    };

    fetchFarms();
  }, [loading, canAssignManager, selectedManager]);

  // 🔥 FUNCIÓN GLOBAL PARA TRAER WORKERS
  const fetchWorkers = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
      const res = await fetch(
        "https://backend-pongase-trucha.onrender.com/api/workers/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      setWorkers(data);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando trabajadores");
    }
  };

  // 🔥 CARGA INICIAL
  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo || !selectedFarm) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    const token = localStorage.getItem("access");

    await toast.promise(
      fetch("https://backend-pongase-trucha.onrender.com/api/invitations/operario/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: correo,
          farm_id: Number(selectedFarm),
        }),
      }).then(async (res) => {
        let data = null;
        try {
          data = await res.json();
        } catch { }

        if (!res.ok) {
          throw new Error(data?.message || "Error al guardar");
        }

        // 🔥 SOLUCIÓN REAL: volver a traer los datos completos
        await fetchWorkers();

        return data;
      }),
      {
        loading: "Creando trabajador...",
        success: () => {
          setCorreo("");
          setSelectedFarm("");
          setOpen(false);

          return "Invitación enviada";
        },
        error: (err) => err.message || "Error al guardar",
      }
    );
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      setCorreo("");
      setSelectedManager("");
      setSelectedFarm("");
    }
  };

  if (loading) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Gestión de Trabajadores</h1>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg">
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Trabajador</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <FieldGroup>
                <Field>
                  <Label>Correo del Operario</Label>
                  <Input
                    type="email"
                    placeholder="correo@correo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                  />
                </Field>

                {canAssignManager && (
                  <Field>
                    <Label>Productor / Manager</Label>
                    <Select 
                      onValueChange={(val) => {
                        setSelectedManager(val);
                        setSelectedFarm("");
                      }} 
                      value={selectedManager} 
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un productor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {managers.map((m) => (
                            <SelectItem key={m.id} value={String(m.id)}>
                              {m.name} {m.lastname}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                <Field>
                  <Label>Granja Asociada</Label>
                  <Select onValueChange={setSelectedFarm} value={selectedFarm} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una granja" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {farms.map((f) => (
                          <SelectItem key={f.id} value={String(f.id)}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.length === 0 ? (
          <p className="text-gray-500">No hay trabajadores aún</p>
        ) : (
          workers.map((w) => (
            <div key={w.worker_id} className="border rounded-lg p-4 group border border-gray-200 hover:border-cyan-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <p className="font-bold group-hover:text-cyan-500">
                {w.name} {w.lastname}
              </p>
              <p className="text-sm text-gray-500">{w.email}</p>
              <p className="text-sm">{w.phone}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}