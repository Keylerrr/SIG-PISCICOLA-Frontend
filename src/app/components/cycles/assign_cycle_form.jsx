'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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

export function AssignCycleForm({
  farmId,
  pondBatchId,
  defaultQuantity,
  defaultMinWeight = 0,
  defaultAvgWeight = 0,
  defaultMaxWeight = 0,
}) {
  const [cycles, setCycles] = useState([]);
  const [speciesMap, setSpeciesMap] = useState({});
  const [loadingCycles, setLoadingCycles] = useState(true);

  const [cycle, setCycle] = useState("");
  const [minWeight, setMinWeight] = useState(defaultMinWeight);
  const [avgWeight, setAvgWeight] = useState(defaultAvgWeight);
  const [maxWeight, setMaxWeight] = useState(defaultMaxWeight);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access");
      try {
        const speciesRes = await fetch(`https://backend-pongase-trucha.onrender.com/api/species/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (speciesRes.ok) {
          const sData = await speciesRes.json();
          const sArray = Array.isArray(sData) ? sData : [];
          const sMap = sArray.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.name }), {});
          setSpeciesMap(sMap);
        }

        const res = await fetch(`https://backend-pongase-trucha.onrender.com/api/farms/${farmId}/cycles/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          const activeCycles = Array.isArray(data) ? data.filter(c => c.state === 'in_progress') : [];
          setCycles(activeCycles);
        } else {
          console.error("Error fetching cycles:", res.statusText);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingCycles(false);
      }
    };
    fetchData();
  }, [farmId]);

  const handleSubmit = async () => {
    if (!cycle) {
      toast.error("Debe seleccionar un ciclo.");
      return;
    }

    const qty = parseInt(defaultQuantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Error: cantidad del lote no válida.");
      return;
    }

    const token = localStorage.getItem("access");

    // GET pond_batch association ID
    let realPondBatchId = null;
    try {
      const pbRes = await fetch(`https://backend-pongase-trucha.onrender.com/api/farms/${farmId}/pond-batches/?batch=${pondBatchId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!pbRes.ok) {
        toast.error("Error obteniendo la asociación del lote con el estanque.");
        return;
      }

      const pbData = await pbRes.json();
      const results = pbData.results || pbData;

      if (Array.isArray(results) && results.length > 0) {
        realPondBatchId = results[0].id;
      } else {
        toast.error("No se encontró la asociación del lote con el estanque.");
        return;
      }
    } catch (err) {
      console.error("Error fetching pond-batch:", err);
      toast.error("Error de red al buscar la asociación del lote.");
      return;
    }

    const payload = {
      cycle: parseInt(cycle),
      pond_batch: parseInt(realPondBatchId),
      quantity: qty,
      min_weight_g: parseFloat(minWeight),
      avg_weight_g: parseFloat(avgWeight),
      max_weight_g: parseFloat(maxWeight),
    };

    try {
      const res = await fetch(`https://backend-pongase-trucha.onrender.com/api/farms/${farmId}/cycles/${cycle}/cycle-batches/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.clone().json().catch(() => ({}));

        const extractErrors = (obj) => {
          if (typeof obj === 'string') return obj;
          if (Array.isArray(obj)) return obj.join(', ');
          if (typeof obj === 'object' && obj !== null) {
            return Object.values(obj)
              .map(val => extractErrors(val))
              .join(' | ');
          }
          return '';
        };

        const parsedError = extractErrors(errorData);
        const errorMsg = parsedError ? parsedError : `Error ${res.status}: Ocurrió un error inesperado`;

        toast.error(errorMsg);
        return;
      }

      toast.success("Lote vinculado correctamente al ciclo.");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error("Error vinculando ciclo:", err);
      toast.error("Error de conexión. Verifica tu internet e intenta nuevamente.");
    }
  };

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Ciclo</FieldLabel>
        <Select onValueChange={setCycle} value={cycle} disabled={loadingCycles}>
          <SelectTrigger>
            <SelectValue placeholder={loadingCycles ? "Cargando ciclos..." : "Seleccione un ciclo en progreso"} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {cycles.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.name} {item.specie ? `(${speciesMap[item.specie] || 'Especie #' + item.specie})` : ''}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-3 gap-2">
        <Field>
          <FieldLabel>Peso Mín (g)</FieldLabel>
          <Input
            type="number"
            step="0.01"
            value={minWeight}
            onChange={(e) => setMinWeight(e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Peso Prom. (g)</FieldLabel>
          <Input
            type="number"
            step="0.01"
            value={avgWeight}
            onChange={(e) => setAvgWeight(e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel>Peso Máx (g)</FieldLabel>
          <Input
            type="number"
            step="0.01"
            value={maxWeight}
            onChange={(e) => setMaxWeight(e.target.value)}
            required
          />
        </Field>
      </div>

      <Field orientation="horizontal" className="justify-end gap-3 mt-4">
        <Button
          type="button"
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Vincular a Ciclo
        </Button>
      </Field>
    </FieldGroup>
  );
}
