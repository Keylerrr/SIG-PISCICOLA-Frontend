'use client';

import { useState } from 'react';
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
  descripcionProp,
  typeProp  
}) {

  const safe = (v) => v ?? "";

  const [nombre, setNombre] = useState(safe(nombreProp))
  const [estado, setEstado] = useState(safe(estadoProp))
  const [capacidad, setCapacidad] = useState(safe(capacidadProp))
  const [area, setArea] = useState(safe(areaProp))
  const [volumen, setVolumen] = useState(safe(volumenProp))
  const [profundidad, setProfundidad] = useState(safe(profundidadProp))
  const [descripcion, setDescripcion] = useState(safe(descripcionProp));
  const [type, setType] = useState(safe(typeProp));  

  const handleReset = () => {
    setNombre("");
    setEstado("");
    setCapacidad("");
    setArea("");
    setVolumen("");
    setProfundidad("");
    setDescripcion("");
    setType("");
  };

  const validate = () => {
    if (!nombre.trim()) {
      alert("El nombre no puede estar vacío.");
      return false;
    }
    if (!["active", "inactive", "in_use", "cleaning"].includes(estado)) {
      alert("Debe seleccionar un estado válido.");
      return false;
    }

    const validTypes = ["dirt", "concrete", "geomembrane", "floating_cage", "raceway", "round_tank"];
    if (!validTypes.includes(type)) {
      alert("Debe seleccionar un tipo de estanque válido.");
      return false;
    }
    const cap = parseFloat(capacidad);
    if (isNaN(cap) || cap <= 0) {
      alert("La capacidad debe ser un número positivo mayor a 0.");
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

    if (descripcion && descripcion.trim().length > 500) {
      alert("La descripción no puede superar los 500 caracteres.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const token = localStorage.getItem("access");

    const payload = {
      name: nombre.trim(),
      status: estado,
      type: type,  
      capacity: parseFloat(capacidad),
      area: parseFloat(area),
      volume: parseFloat(volumen),
      depth: parseFloat(profundidad),
      description: descripcion.trim(),  
    };

    try {
      const res = await fetch(`https://backend-pongase-trucha.onrender.com/api/farms/${idFarmProp}/ponds/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.clone().json().catch(() => ({}));
        const errorMsg = 
          errorData.detail || 
          errorData.name?.[0] || 
          errorData.type?.[0] ||
          errorData.non_field_errors?.[0] || 
          `Error ${res.status}: ${res.statusText}`;
        alert(errorMsg);
        return;
      }

      window.location.reload();
    } catch (err) {
      console.error("Error registro:", err);
      alert("Error de conexión. Verifica tu internet e intenta nuevamente.");
    }
  };

  const handleEdit = async () => {
    if (!validate()) return;

    const token = localStorage.getItem("access");

    const payload = {
      name: nombre.trim(),
      status: estado,
      type: type,  
      capacity: parseFloat(capacidad),
      area: parseFloat(area),
      volume: parseFloat(volumen),
      depth: parseFloat(profundidad),
      description: descripcion.trim(),
    };

    try {
      const res = await fetch(`https://backend-pongase-trucha.onrender.com/api/farms/${idFarmProp}/ponds/${idProp}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.clone().json().catch(() => ({}));
        const errorMsg = 
          errorData.detail || 
          errorData.name?.[0] || 
          errorData.type?.[0] ||
          errorData.non_field_errors?.[0] || 
          `Error ${res.status}: ${res.statusText}`;
        alert(errorMsg);
        return;
      }

      window.location.reload();
    } catch (err) {
      console.error("Error edición:", err);
      alert("Error de conexión. Verifica tu internet e intenta nuevamente.");
    }
  };

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Nombre del Estanque</FieldLabel>
        <Input 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          placeholder="Ej: Estanque Principal"
          required
        />
      </Field>

      <Field>
        <FieldLabel>Estado del estanque</FieldLabel>
        <Select onValueChange={setEstado} value={estado}>
          <SelectTrigger>
            <SelectValue placeholder="Escoja un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
              <SelectItem value="in_use">En uso</SelectItem>
              <SelectItem value="cleaning">En limpieza</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      {}
      <Field>
        <FieldLabel>Tipo de Estanque</FieldLabel>
        <Select onValueChange={setType} value={type}>
          <SelectTrigger>
            <SelectValue placeholder="Escoja un tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="geomembrane">Geomembrana</SelectItem>
              <SelectItem value="concrete">Concreto</SelectItem>
              <SelectItem value="dirt">Tierra</SelectItem>
              <SelectItem value="floating_cage">Jaula flotante</SelectItem>
              <SelectItem value="raceway">Canal de flujo</SelectItem>
              <SelectItem value="round_tank">Tanque circular</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Capacidad (# peces)</FieldLabel>
        <Input 
          type="number" 
          step="0.01"
          min="0"
          value={capacidad} 
          onChange={(e) => setCapacidad(e.target.value)} 
          placeholder="Ej: 1000.50"
          required
        />
      </Field>

      <Field>
        <FieldLabel>Área (m²)</FieldLabel>
        <Input 
          type="number" 
          step="0.01"
          min="0"
          value={area} 
          onChange={(e) => setArea(e.target.value)} 
          placeholder="Ej: 500.25"
          required
        />
      </Field>

      <Field>
        <FieldLabel>Volumen (m³)</FieldLabel>
        <Input 
          type="number" 
          step="0.01"
          min="0"
          value={volumen} 
          onChange={(e) => setVolumen(e.target.value)} 
          placeholder="Ej: 1200.00"
          required
        />
      </Field>

      <Field>
        <FieldLabel>Profundidad (m)</FieldLabel>
        <Input 
          type="number" 
          step="0.01"
          min="0"
          value={profundidad} 
          onChange={(e) => setProfundidad(e.target.value)} 
          placeholder="Ej: 2.40"
          required
        />
      </Field>

      <Field>
        <FieldLabel>Descripción (opcional)</FieldLabel>
        <Input 
          value={descripcion} 
          onChange={(e) => setDescripcion(e.target.value)} 
          placeholder="Detalles adicionales del estanque..."
          maxLength={500}
        />
      </Field>

      <Field orientation="horizontal" className="justify-end gap-3 mt-4">
        <Button type="button" variant="outline" onClick={handleReset}>
          Borrar
        </Button>
        <Button 
          type="button" 
          onClick={op === 1 ? handleSubmit : handleEdit}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {op === 1 ? "Crear" : "Actualizar"}
        </Button>
      </Field>
    </FieldGroup>
  );
}