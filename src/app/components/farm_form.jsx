"use client";

import { useState, useEffect } from "react";
import { useFlags } from '@/hooks/useFlags';
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

export function FarmRegisterForm({
  op,
  idProp,
  nombreProp,
  departamentoProp,
  ciudadProp,
  direccionProp,
  areaProp,
}) {
  const safe = (v) => v ?? "";

  const [nombre, setNombre] = useState(safe(nombreProp));
  const [departamentos, setDepartamentos] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(
    safe(departamentoProp)
  );

  const [ciudades, setCiudades] = useState([]);
  const [selectedCity, setSelectedCity] = useState(safe(ciudadProp));

  const [direccion, setDireccion] = useState(safe(direccionProp));
  const [totalArea, setArea] = useState(safe(areaProp));

  const { flags, loading } = useFlags();
  const canAssignManager = flags?.farm?.assignManager;

  const [productores, setProductores] = useState([]);
  const [selectedProductor, setSelectedProductor] = useState("");

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
      .then((data) => setProductores(data))
      .catch(console.error);
  }, [canAssignManager]);

  useEffect(() => {
    fetch("https://backend-pongase-trucha.onrender.com/api/departments/")
      .then((res) => {
        if (!res.ok) throw new Error("Error al traer departamentos");
        return res.json();
      })
      .then((data) => setDepartamentos(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedDepartment) return;

    fetch(
      `https://backend-pongase-trucha.onrender.com/api/cities/?department_id=${selectedDepartment}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Error al traer ciudades");
        return res.json();
      })
      .then((data) => setCiudades(data))
      .catch(console.error);
  }, [selectedDepartment]);

  const handleReset = () => {
    setNombre("");
    setSelectedDepartment("");
    setSelectedCity("");
    setDireccion("");
    setArea("");
    setSelectedProductor("");
  };

  const validate = () => {
    if (!nombre.trim()) return alert("Nombre requerido"), false;
    if (!selectedDepartment) return alert("Seleccione departamento"), false;
    if (!selectedCity) return alert("Seleccione ciudad"), false;
    if (!direccion.trim()) return alert("Dirección requerida"), false;

    const area = parseFloat(totalArea);
    if (isNaN(area) || area <= 0)
      return alert("Área inválida"), false;

    if (canAssignManager && !selectedProductor) {
      return alert("Debe seleccionar un productor"), false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const token = localStorage.getItem("access");

    const payload = {
      name: nombre,
      department: Number(selectedDepartment),
      city: Number(selectedCity),
      address: direccion,
      total_area_ha: Number(totalArea),
    };

    if (canAssignManager) {
      payload.productor_id = Number(selectedProductor);
    }

    try {
      const res = await fetch(
        "https://backend-pongase-trucha.onrender.com/api/farms/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Error al crear granja");

      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = async () => {
    if (!validate()) return;

    const token = localStorage.getItem("access");

    const payload = {
      name: nombre,
      department: Number(selectedDepartment),
      city: Number(selectedCity),
      address: direccion,
      total_area_ha: Number(totalArea),
    };

    if (canAssignManager) {
      payload.productor_id = Number(selectedProductor);
    }

    try {
      const res = await fetch(
        `https://backend-pongase-trucha.onrender.com/api/farms/${idProp}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Error al editar granja");

      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return null;

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Nombre</FieldLabel>
        <Input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </Field>

      {canAssignManager && (
        <Field>
          <FieldLabel>Productor</FieldLabel>
          <Select
            onValueChange={setSelectedProductor}
            value={selectedProductor}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un productor" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {productores.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name} {p.lastname}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      )}

      <Field>
        <FieldLabel>Departamento</FieldLabel>
        <Select
          onValueChange={setSelectedDepartment}
          value={String(selectedDepartment)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {departamentos.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Ciudad</FieldLabel>
        <Select
          onValueChange={setSelectedCity}
          value={String(selectedCity)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ciudades.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Dirección</FieldLabel>
        <Input
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel>Área (ha)</FieldLabel>
        <Input
          type="number"
          value={totalArea}
          onChange={(e) => setArea(e.target.value)}
        />
      </Field>

      <Field orientation="horizontal">
        <Button onClick={handleReset}>Borrar</Button>
        <Button onClick={op === 1 ? handleSubmit : handleEdit}>
          Guardar
        </Button>
      </Field>
    </FieldGroup>
  );
}