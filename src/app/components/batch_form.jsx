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

export function BatchRegisterForm({
  op,
  idProp,
  idFarmProp,
  specieProp,
  biologicalStateProp,
  statusProp,
  initialQuantityProp,
  minWeightGProp,
  avgWeightGProp,
  maxWeightGProp
}) {

  const safe = (v) => v ?? "";

  const [specie, setSpecie] = useState(safe(specieProp))
  const [biologicalState, setBiologicalState] = useState(safe(biologicalStateProp))
  const [status, setStatus] = useState(safe(statusProp))
  const [initialQuantity, setInitialQuantity] = useState(safe(initialQuantityProp))
  const [minWeightG, setMinWeightG] = useState(safe(minWeightGProp))
  const [avgWeightG, setAvgWeightG] = useState(safe(avgWeightGProp))
  const [maxWeightG, setMaxWeightG] = useState(safe(maxWeightGProp))

  const handleReset = () => {
    setSpecie("");
    setBiologicalState("");
    setStatus("");
    setInitialQuantity("");
    setMinWeightG("");
    setAvgWeightG("");
    setMaxWeightG("");
  };

  const validate = () => {
    const spec = parseInt(specie);
    if (isNaN(spec) || spec <= 0) {
      alert("La especie debe ser un ID válido mayor a 0.");
      return false;
    }
    const validBiologicalStates = ["alevin", "fingerling", "juvenile", "adult"];
    if (!validBiologicalStates.includes(biologicalState)) {
      alert("Debe seleccionar un estado biológico válido.");
      return false;
    }
    const validStatuses = ["active", "inactive", "completed", "sold"];
    if (!validStatuses.includes(status)) {
      alert("Debe seleccionar un estado válido.");
      return false;
    }
    const qty = parseInt(initialQuantity);
    if (isNaN(qty) || qty <= 0) {
      alert("La cantidad inicial debe ser un número entero positivo mayor a 0.");
      return false;
    }
    const minW = parseFloat(minWeightG);
    if (isNaN(minW) || minW < 0) {
      alert("El peso mínimo debe ser un número válido mayor o igual a 0.");
      return false;
    }
    const avgW = parseFloat(avgWeightG);
    if (isNaN(avgW) || avgW < 0) {
      alert("El peso promedio debe ser un número válido mayor o igual a 0.");
      return false;
    }
    const maxW = parseFloat(maxWeightG);
    if (isNaN(maxW) || maxW < 0) {
      alert("El peso máximo debe ser un número válido mayor o igual a 0.");
      return false;
    }
    if (minW > avgW || avgW > maxW) {
      alert("Los pesos deben estar en orden: mínimo <= promedio <= máximo.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const token = localStorage.getItem("access");

    const payload = {
      specie: parseInt(specie),
      biological_state: biologicalState,
      status: status,
      initial_quantity: parseInt(initialQuantity),
      min_weight_g: parseFloat(minWeightG),
      avg_weight_g: parseFloat(avgWeightG),
      max_weight_g: parseFloat(maxWeightG),
    };

    try {
      const res = await fetch(`https://backend-pongase-trucha.onrender.com/api/farms/${idFarmProp}/batches/`, {
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
          errorData.specie?.[0] || 
          errorData.biological_state?.[0] ||
          errorData.status?.[0] ||
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
      specie: parseInt(specie),
      biological_state: biologicalState,
      status: status,
      initial_quantity: parseInt(initialQuantity),
      min_weight_g: parseFloat(minWeightG),
      avg_weight_g: parseFloat(avgWeightG),
      max_weight_g: parseFloat(maxWeightG),
    };

    try {
      const res = await fetch(`https://backend-pongase-trucha.onrender.com/api/farms/${idFarmProp}/batches/${idProp}/`, {
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
          errorData.specie?.[0] || 
          errorData.biological_state?.[0] ||
          errorData.status?.[0] ||
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
        <FieldLabel>Especie (ID)</FieldLabel>
        <Input 
          type="number"
          min="1"
          value={specie} 
          onChange={(e) => setSpecie(e.target.value)} 
          placeholder="Ej: 1"
          required
        />
      </Field>

      <Field>
        <FieldLabel>Estado Biológico</FieldLabel>
        <Select onValueChange={setBiologicalState} value={biologicalState}>
          <SelectTrigger>
            <SelectValue placeholder="Escoja un estado biológico" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="alevin">Alevín</SelectItem>
              <SelectItem value="fingerling">Fingerling</SelectItem>
              <SelectItem value="juvenile">Juvenil</SelectItem>
              <SelectItem value="adult">Adulto</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Estado</FieldLabel>
        <Select onValueChange={setStatus} value={status}>
          <SelectTrigger>
            <SelectValue placeholder="Escoja un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="sold">Vendido</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Cantidad Inicial</FieldLabel>
        <Input 
          type="number" 
          min="1"
          value={initialQuantity} 
          onChange={(e) => setInitialQuantity(e.target.value)} 
          placeholder="Ej: 5000"
          required
        />
      </Field>

      <Field>
        <FieldLabel>Peso Mínimo (g)</FieldLabel>
        <Input 
          type="number" 
          step="0.01"
          min="0"
          value={minWeightG} 
          onChange={(e) => setMinWeightG(e.target.value)} 
          placeholder="Ej: 0.5"
          required
        />
      </Field>

      <Field>
        <FieldLabel>Peso Promedio (g)</FieldLabel>
        <Input 
          type="number" 
          step="0.01"
          min="0"
          value={avgWeightG} 
          onChange={(e) => setAvgWeightG(e.target.value)} 
          placeholder="Ej: 1.0"
          required
        />
      </Field>

      <Field>
        <FieldLabel>Peso Máximo (g)</FieldLabel>
        <Input 
          type="number" 
          step="0.01"
          min="0"
          value={maxWeightG} 
          onChange={(e) => setMaxWeightG(e.target.value)} 
          placeholder="Ej: 1.5"
          required
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