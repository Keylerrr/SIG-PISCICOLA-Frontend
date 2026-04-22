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
  estadoProp,
  capacidadProp,
  areaProp,
  volumenProp,
  profundidadProp,
  descripcionProp
}) {
  // 🔥 SAFE VALUES (evita null)
  const safe = (v) => v ?? "";

  const [nombre, setNombre] = useState(safe(nombreProp))
  const [estado, setEstado] = useState(safe(estadoProp))
  const [capacidad, setCapacidad] = useState(safe(capacidadProp))
  const [area, setArea] = useState(safe(areaProp))
  const [volumen, setVolumen] = useState(safe(volumenProp))
  const [profundidad, setProfundidad] = useState(safe(profundidadProp))
  const [descripcion, setDescripcion] = useState(safe(descripcionProp));

  //RESET
  const handleReset = () => {
    setNombre("");
    setEstado("");
    setCapacidad("");
    setArea("");
    setVolumen("");
    setProfundidad("");
    setDescripcion("");
  };

  // VALIDATION
  const validate = () => {
    if (!nombre.trim()) {
      alert("El nombre no puede estar vacío.");
      return false;
    }
    if (!["active", "inactive", "in_use", "cleaning"].includes(estado)) {
      alert("Debe seleccionar un estado válido.");
      return false;
    }
    const cap = parseInt(capacidad);
    if (isNaN(cap) || cap <= 0) {
      alert("La capacidad debe ser un número entero positivo mayor a 0.");
      return false;
    }
    const ar = parseFloat(area);
    if (isNaN(ar) || ar <= 0) {
      alert("El área debe ser un número positivo válido.");
      return false;
    }
    const vol = parseFloat(volumen);
    if (isNaN(vol) || vol <= 0) {
      alert("El volumen debe ser un número positivo válido.");
      return false;
    }
    const dep = parseFloat(profundidad);
    if (isNaN(dep) || dep <= 0) {
      alert("La profundidad debe ser un número positivo válido.");
      return false;
    }
    if (!descripcion.trim()) {
      alert("La descripción no puede estar vacía.");
      return false;
    }
    return true;
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (!validate()) return;

    const token = localStorage.getItem("access");

    const payload = {
      farm: idFarmProp,
      name: nombre,
      status: estado,
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
    if (!validate()) return;

    const token = localStorage.getItem("access");

    const payload = {
      name: nombre,
      status: estado,
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
        <FieldLabel>Nombre del Estanque</FieldLabel>
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </Field>

      <Field>
        <FieldLabel>Estado del estanque</FieldLabel>
        <Select onValueChange={setEstado} value={estado}>
          <SelectTrigger>
            <SelectValue placeholder="Escoja un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem key="active" value="active">
                Activo
              </SelectItem>
              <SelectItem key="inactive" value="inactive">
                Inactivo
              </SelectItem>
              <SelectItem key="in_use" value="in_use">
                En uso
              </SelectItem>
              <SelectItem key="cleaning" value="cleaning">
                En limpieza
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      
      <Field>
        <FieldLabel>Capacidad</FieldLabel>
        <Input type="number" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} />
      </Field>

      <Field>
        <FieldLabel>Área</FieldLabel>
        <Input type="number" value={area} onChange={(e) => setArea(e.target.value)} />
      </Field>

      <Field>
        <FieldLabel>Volumen</FieldLabel>
        <Input type="number" value={volumen} onChange={(e) => setVolumen(e.target.value)} />
      </Field>

      <Field>
        <FieldLabel>Profundidad</FieldLabel>
        <Input type="number" value={profundidad} onChange={(e) => setProfundidad(e.target.value)} />
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