"use client";

import { useState } from "react";
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

export function RegisterManager() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [numero, setNumero] = useState("");
  const [correo, setCorreo] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombres || !apellidos || !numero || !correo) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    const token = localStorage.getItem("access");

    await toast.promise(
      fetch("https://backend-pongase-trucha.onrender.com/managers/", {
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
          throw new Error(data?.message || "Error al guardar gerente");
        }

        return data;
      }),
      {
        loading: "Creando gerente...",
        success: (data) => {
          // limpiar campos
          setNombres("");
          setApellidos("");
          setNumero("");
          setCorreo("");

          // cerrar modal
          setOpen(false);

          return data?.message || "Gerente creado correctamente";
        },
        error: (err) => err.message || "Error al guardar gerente",
      }
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Gestión de Gerentes</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Gerente</DialogTitle>
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
    </div>
  );
}