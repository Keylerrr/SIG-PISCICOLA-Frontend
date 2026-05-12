"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { feedingService } from "@/lib/feedingService";
import { toast } from "sonner";

function normalizeFieldErrors(fieldErrors) {
  if (!fieldErrors) {
    return [];
  }

  if (Array.isArray(fieldErrors)) {
    return fieldErrors.map((message) => ({ message: typeof message === "string" ? message : JSON.stringify(message) }));
  }

  return [{ message: fieldErrors.toString() }];
}

const TYPES = [
  { value: "alevin", label: "Alevín" },
  { value: "rising", label: "Crecimiento" },
  { value: "fatting", label: "Engorde" },
  { value: "breeding", label: "Reproducción" },
];

export function FeedingScheduleForm({ farmId, onSuccess }) {
  const [form, setForm] = useState({
    product: "",
    specie: "",
    name: "",
    type: "",
    feeding_rate_percentage: "",
    times_per_day: "",
    comments: "",
    aceptable_min_weight_g: "",
    aceptable_max_weight_g: "",
    feed_form: "",
    pellet_size_mm: "",
    gap_between_times_per_day: "",
    gap_between_completed_day: "",
    expected_fca: "",
    expected_daily_gain_g: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [species, setSpecies] = useState([]);

  useEffect(() => {
    async function loadOptions() {
      const token = localStorage.getItem("access");

      try {
        const productResponse = await fetch(
          `https://backend-pongase-trucha.onrender.com/api/farms/${farmId}/products/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (productResponse.ok) {
          const productData = await productResponse.json();
          setProducts(Array.isArray(productData) ? productData : []);
        }
      } catch (error) {
        console.error("No se pudieron cargar productos de alimentación:", error);
      }

      try {
        const speciesResponse = await fetch("https://backend-pongase-trucha.onrender.com/api/species/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (speciesResponse.ok) {
          const speciesData = await speciesResponse.json();
          setSpecies(Array.isArray(speciesData) ? speciesData : []);
        }
      } catch (error) {
        console.error("No se pudieron cargar especies:", error);
      }
    }

    loadOptions();
  }, [farmId]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    const requiredFields = ["product", "specie", "name", "type", "feeding_rate_percentage", "times_per_day"];
    const missing = requiredFields.filter((field) => !form[field]?.toString().trim());

    if (missing.length > 0) {
      setErrors(
        missing.reduce((acc, field) => {
          acc[field] = ["Este campo es obligatorio."];
          return acc;
        }, {})
      );
      return;
    }

    if (Number(form.times_per_day) <= 0) {
      setErrors((prev) => ({ ...prev, times_per_day: ["Debe ser un número mayor a 0."] }));
      return;
    }

    setSaving(true);

    try {
      const payload = {
        product: Number(form.product),
        specie: Number(form.specie),
        name: form.name.trim(),
        type: form.type,
        feeding_rate_percentage: Number(form.feeding_rate_percentage),
        times_per_day: Number(form.times_per_day),
        comments: form.comments.trim() || undefined,
        aceptable_min_weight_g: form.aceptable_min_weight_g ? Number(form.aceptable_min_weight_g) : undefined,
        aceptable_max_weight_g: form.aceptable_max_weight_g ? Number(form.aceptable_max_weight_g) : undefined,
        feed_form: form.feed_form.trim() || undefined,
        pellet_size_mm: form.pellet_size_mm ? Number(form.pellet_size_mm) : undefined,
        gap_between_times_per_day: form.gap_between_times_per_day.trim() || undefined,
        gap_between_completed_day: form.gap_between_completed_day.trim() || undefined,
        expected_fca: form.expected_fca ? Number(form.expected_fca) : undefined,
        expected_daily_gain_g: form.expected_daily_gain_g ? Number(form.expected_daily_gain_g) : undefined,
      };

      const response = await feedingService.createFeedingSchedule(farmId, payload);
      toast.success("Cronograma creado correctamente.");
      if (response?.warnings) {
        toast(`Advertencia del cronograma: ${response.warnings}`);
      }
      setForm({
        product: "",
        specie: "",
        name: "",
        type: "",
        feeding_rate_percentage: "",
        times_per_day: "",
        comments: "",
        aceptable_min_weight_g: "",
        aceptable_max_weight_g: "",
        feed_form: "",
        pellet_size_mm: "",
        gap_between_times_per_day: "",
        gap_between_completed_day: "",
        expected_fca: "",
        expected_daily_gain_g: "",
      });
      setErrors({});
      onSuccess?.();
    } catch (error) {
      if (error.status === 400 && error.payload && typeof error.payload === "object") {
        setErrors(error.payload);
      } else {
        toast.error("No se pudo crear el cronograma.");
        console.error(error);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Field>
          <FieldLabel>Producto</FieldLabel>
          <Select value={form.product || undefined} onValueChange={(value) => setField("product", value === "__NONE__" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un producto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__NONE__">Selecciona</SelectItem>
              {products.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={normalizeFieldErrors(errors.product)} />
        </Field>

        <Field>
          <FieldLabel>Especie</FieldLabel>
          <Select value={form.specie || undefined} onValueChange={(value) => setField("specie", value === "__NONE__" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una especie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__NONE__">Selecciona</SelectItem>
              {species.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={normalizeFieldErrors(errors.specie)} />
        </Field>

        <Field>
          <FieldLabel>Nombre</FieldLabel>
          <Input value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="Ej. Cronograma de engorde" />
          <FieldError errors={normalizeFieldErrors(errors.name)} />
        </Field>

        <Field>
          <FieldLabel>Tipo</FieldLabel>
          <Select value={form.type || undefined} onValueChange={(value) => setField("type", value === "__NONE__" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__NONE__">Selecciona</SelectItem>
              {TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={normalizeFieldErrors(errors.type)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Field>
          <FieldLabel>Porcentaje de alimentación</FieldLabel>
          <Input type="number" min="0" step="0.1" value={form.feeding_rate_percentage} onChange={(event) => setField("feeding_rate_percentage", event.target.value)} placeholder="Ej. 3.5" />
          <FieldError errors={normalizeFieldErrors(errors.feeding_rate_percentage)} />
        </Field>

        <Field>
          <FieldLabel>Veces por día</FieldLabel>
          <Input type="number" min="1" step="1" value={form.times_per_day} onChange={(event) => setField("times_per_day", event.target.value)} placeholder="Ej. 3" />
          <FieldError errors={normalizeFieldErrors(errors.times_per_day)} />
        </Field>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field>
          <FieldLabel>Peso mínimo aceptable (g)</FieldLabel>
          <Input type="number" min="0" value={form.aceptable_min_weight_g} onChange={(event) => setField("aceptable_min_weight_g", event.target.value)} />
          <FieldError errors={normalizeFieldErrors(errors.aceptable_min_weight_g)} />
        </Field>

        <Field>
          <FieldLabel>Peso máximo aceptable (g)</FieldLabel>
          <Input type="number" min="0" value={form.aceptable_max_weight_g} onChange={(event) => setField("aceptable_max_weight_g", event.target.value)} />
          <FieldError errors={normalizeFieldErrors(errors.aceptable_max_weight_g)} />
        </Field>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field>
          <FieldLabel>Forma del alimento</FieldLabel>
          <Input value={form.feed_form} onChange={(event) => setField("feed_form", event.target.value)} placeholder="Ej. pellet flake" />
          <FieldError errors={normalizeFieldErrors(errors.feed_form)} />
        </Field>

        <Field>
          <FieldLabel>Tamaño de pellet (mm)</FieldLabel>
          <Input type="number" min="0" step="0.1" value={form.pellet_size_mm} onChange={(event) => setField("pellet_size_mm", event.target.value)} />
          <FieldError errors={normalizeFieldErrors(errors.pellet_size_mm)} />
        </Field>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field>
          <FieldLabel>Gap entre tiempos por día</FieldLabel>
          <Input value={form.gap_between_times_per_day} onChange={(event) => setField("gap_between_times_per_day", event.target.value)} placeholder="Ej. 2h" />
          <FieldError errors={normalizeFieldErrors(errors.gap_between_times_per_day)} />
        </Field>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field>
          <FieldLabel>Gap entre días completados</FieldLabel>
          <Input value={form.gap_between_completed_day} onChange={(event) => setField("gap_between_completed_day", event.target.value)} placeholder="Ej. 1 día" />
          <FieldError errors={normalizeFieldErrors(errors.gap_between_completed_day)} />
        </Field>

        <Field>
          <FieldLabel>FCA esperado</FieldLabel>
          <Input type="number" min="0" step="0.01" value={form.expected_fca} onChange={(event) => setField("expected_fca", event.target.value)} />
          <FieldError errors={normalizeFieldErrors(errors.expected_fca)} />
        </Field>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field>
          <FieldLabel>Ganancia diaria esperada (g)</FieldLabel>
          <Input type="number" min="0" step="0.1" value={form.expected_daily_gain_g} onChange={(event) => setField("expected_daily_gain_g", event.target.value)} />
          <FieldError errors={normalizeFieldErrors(errors.expected_daily_gain_g)} />
        </Field>
      </div>

      <Field>
        <FieldLabel>Comentarios</FieldLabel>
        <textarea
          value={form.comments}
          onChange={(event) => setField("comments", event.target.value)}
          className="min-h-25 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="Comentarios adicionales"
        />
        <FieldError errors={normalizeFieldErrors(errors.comments)} />
      </Field>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="submit" disabled={saving} className="inline-flex items-center gap-2">
          {saving ? "Guardando…" : "Crear cronograma"}
        </Button>
      </div>
    </form>
  );
}
