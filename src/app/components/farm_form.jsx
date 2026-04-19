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

export function FarmRegisterForm({
  op,
  idProp,
  nombreProp,
  departamentoProp,
  ciudadProp,
  direccionProp,
  areaProp,
  managerProp
}) {
  // 🔥 SAFE VALUES (evita null)
  const safe = (v) => v ?? "";

  const [nombre, setNombre] = useState(safe(nombreProp));
  const [selectedDepartment, setSelectedDepartment] = useState(safe(departamentoProp));
  const [selectedCity, setSelectedCity] = useState(safe(ciudadProp));
  const [direccion, setDireccion] = useState(safe(direccionProp));
  const [totalArea, setArea] = useState(safe(areaProp));
  const [selectedManager, setSelectedManager] = useState(
    managerProp ? String(managerProp) : ""
  );

  const [departamentos, setDepartmentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [managers, setManagers] = useState([]);
  const [role, setRole] = useState(null);

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

  // FETCH DATA
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userRole = payload.role;

      // SOLO ADMIN TRAE MANAGERS
      if (userRole === "admin") {
        fetch("https://backend-pongase-trucha.onrender.com/managers/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
          })
          .then(setManagers)
          .catch(() => console.error("Error managers"));
      }

      // DEPARTAMENTOS
      fetch("https://backend-pongase-trucha.onrender.com/farm/departments/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => setDepartmentos(data.departments))
        .catch(() => console.error("Error departamentos"));

    } catch {
      console.error("Token inválido");
    }
  }, []);

  // CIUDADES
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!selectedDepartment) return;

    fetch(`https://backend-pongase-trucha.onrender.com/farm/departments/${selectedDepartment}/cities/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setCiudades(data.cities))
      .catch(() => console.error("Error ciudades"));

  }, [selectedDepartment]);

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
      name: nombre,
      department: selectedDepartment,
      city: selectedCity,
      address: direccion,
      total_area_ha: Number(totalArea),
    };

    // SOLO ADMIN ENVÍA MANAGER
    if (role === "admin") {
      payload.manager_id = Number(selectedManager);
    }

    try {
      const res = await fetch("https://backend-pongase-trucha.onrender.com/farm/", {
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
      department: selectedDepartment,
      city: selectedCity,
      address: direccion,
      total_area_ha: Number(totalArea),
    };

    if (role === "admin") {
      payload.manager_id = Number(selectedManager);
      payload.manager_name = managers.find(
        m => m.manager_id === Number(selectedManager)
      )?.name;
    }

    try {
      const res = await fetch(`https://backend-pongase-trucha.onrender.com/farm/${idProp}/`, {
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
        <FieldLabel>Departamento</FieldLabel>
        <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
          <SelectTrigger>
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {departamentos.map((d) => (
                <SelectItem key={d.key} value={String(d.key)}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Ciudad</FieldLabel>
        <Select onValueChange={setSelectedCity} value={selectedCity}>
          <SelectTrigger>
            <SelectValue placeholder="Ciudad" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ciudades.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Dirección</FieldLabel>
        <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
      </Field>

      <Field>
        <FieldLabel>Área (ha)</FieldLabel>
        <Input type="number" value={totalArea} onChange={(e) => setArea(e.target.value)} />
      </Field>

      {/*SOLO ADMIN VE ESTO */}
      {role === "admin" && (
        <Field>
          <FieldLabel>Dueño</FieldLabel>
          <Select onValueChange={setSelectedManager} value={selectedManager}>
            <SelectTrigger>
              <SelectValue placeholder="Elegir manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {managers.map((m) => (
                  <SelectItem key={m.manager_id} value={String(m.manager_id)}>
                    {m.name} {m.lastname}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      )}

      <Field orientation="horizontal">
        <Button onClick={handleReset}>Borrar</Button>
        <Button onClick={op === 1 ? handleSubmit : handleEdit}>
          {op === 1 ? "Crear" : "Actualizar"}
        </Button>
      </Field>

    </FieldGroup>
  );
}