"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
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

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [numero, setNumero] = useState("");
  const [correo, setCorreo] = useState("");
  const [open, setOpen] = useState(false);

  // 🔥 FUNCIÓN GLOBAL PARA TRAER WORKERS
  const fetchWorkers = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
      const res = await fetch(
        "https://backend-pongase-trucha.onrender.com/workers/",
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

    if (!nombres || !apellidos || !numero || !correo) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    const token = localStorage.getItem("access");

    await toast.promise(
      fetch("https://backend-pongase-trucha.onrender.com/workers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: nombres,
          lastname: apellidos,
          email: correo,
          phone: numero,
        }),
      }).then(async (res) => {
        let data = null;
        try {
          data = await res.json();
        } catch {}

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
          setNombres("");
          setApellidos("");
          setNumero("");
          setCorreo("");
          setOpen(false);

          return "Trabajador creado";
        },
        error: (err) => err.message || "Error al guardar",
      }
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Gestión de Trabajadores</h1>

        <Dialog open={open} onOpenChange={setOpen}>
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
                  <Label>Nombres</Label>
                  <Input
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Label>Apellidos</Label>
                  <Input
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Label>Celular</Label>
                  <Input
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Label>Correo</Label>
                  <Input
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                  />
                </Field>
              </FieldGroup>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 🔥 LISTADO */}
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