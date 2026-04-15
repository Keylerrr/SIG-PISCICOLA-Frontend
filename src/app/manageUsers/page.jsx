"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  Pencil,
  Shield,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button"
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
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ManageUsers() {
  const router = useRouter();
  const [nombres, setNombres] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [numero, setNumero] = useState("")
  const [correo, setCorreo] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nombres || !apellidos || !numero || !correo) {
      alert("Todos los campos son obligatorios")
      return
    }

    try {
      const res = await fetch("http://localhost:8080/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombres,
          apellidos,
          numero,
          correo,
        }),
      })

      if (!res.ok) throw new Error("Error al guardar")

      console.log("Usuario guardado")

      setNombres("")
      setApellidos("")
      setNumero("")
      setCorreo("")

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al Dashboard</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>

            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
                  <Plus className="w-4 h-4" />
                  Agregar Nuevo Usuario
                </button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Usuario</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
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
                      <Label>Número de celular</Label>
                      <Input
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        required
                      />
                    </Field>
                    <Field>
                      <Label>Correo electrónico</Label>
                      <Input
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                      />
                    </Field>
                  </FieldGroup>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit">Guardar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <div>
              <p className="font-bold">{}</p>
              <p>Total</p>
            </div>
            <div>
              <p className="font-bold">{}</p>
              <p>Admins</p>
            </div>
            <div>
              <p className="font-bold">{}</p>
              <p>Operarios</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}