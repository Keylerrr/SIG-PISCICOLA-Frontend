'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function PondRegisterForm({
  op,
  idProp,
  idFarmProp,
  nombreProp,
  capacidadProp,
  areaProp,
  volumenProp,
  profundidadProp,
  descripcionProp
}) {
  // 🔥 SAFE VALUES (evita null)
  const safe = (v) => v ?? "";

  const [nombre, ] = useState(safe(nombreProp))
  const [capacidad, setCapacidad] = useState(safe(capacidadProp))
  const [area, setArea] = useState(safe(areaProp))
  const [volumen, setVolumen] = useState(safe(volumenProp))
  const [profundidad, setProfundidad] = useState(safe(profundidadProp))
  const [descripcion, setDescripcion] = useState(safe(descripcionProp));

  // 🔥 OBTENER ROLE
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setRole(payload.role);
    } catch {
      console.error("Token inválido");
    }
  }, []);

  // RESET
  const handleReset = () => {
    setNombre("");
    setSelectedDepartment("");
    setSelectedCity("");
    setDireccion("");
    setArea("");
    setSelectedManager("");
  };

  // SUBMIT
  const handleSubmit = async () => {
    const token = localStorage.getItem("access");

    const payload = {
      farm: idFarmProp,
      name: nombre,
      capacity: Number(capacidad),
      area: Number(area),
      volume: Number(volumen),
      depth: Number(profundidad),
      description: descripcion,
    };

    try {
      const res = await fetch("https://backend-pongase-trucha.onrender.com/ponds/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) window.location.reload();
    } catch (err) {
      console.error("Error registro:", err);
    }
  };

  // EDIT
  const handleEdit = async () => {
    const token = localStorage.getItem("access");

    const payload = {
      name: nombre,
      capacity: Number(capacidad),
      area: Number(area),
      volume: Number(volumen),
      depth: Number(profundidad),
      description: descripcion,
    };

    try {
      const res = await fetch(`https://backend-pongase-trucha.onrender.com/ponds/${idProp}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) window.location.reload();
    } catch (err) {
      console.error("Error edición:", err);
    }
  };

  return (
    <FieldGroup>

      <Field>
        <FieldLabel>Nombre de la Granja</FieldLabel>
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </Field>
      
      <Field>
        <FieldLabel>Capacidad</FieldLabel>
        <Input value={capacidad} onChange={(e) => setCapacidad(e.target.value)} />
      </Field>

      <Field>
        <FieldLabel>Área</FieldLabel>
        <Input value={area} onChange={(e) => setArea(e.target.value)} />
      </Field>

      <Field>
        <FieldLabel>Volumen</FieldLabel>
        <Input value={volumen} onChange={(e) => setVolumen(e.target.value)} />
      </Field>

      <Field>
        <FieldLabel>Profundidad</FieldLabel>
        <Input value={profundidad} onChange={(e) => setProfundidad(e.target.value)} />
      </Field>

      <Field>
        <FieldLabel>Descripción</FieldLabel>
        <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </Field>

      <Field orientation="horizontal">
        <Button onClick={handleReset}>Borrar</Button>
        <Button onClick={op === 1 ? handleSubmit : handleEdit}>
          {op === 1 ? "Crear" : "Actualizar"}
        </Button>
      </Field>

    </FieldGroup>
  );
}