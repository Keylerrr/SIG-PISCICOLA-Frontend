'use client';

import { useFlags } from '@/hooks/useFlags';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"


export function FarmRegisterForm({ op, idProp, nombreProp, departamentoProp, ciudadProp, direccionProp, areaProp, managerProp }) {
  const safe = (v) => v ?? "";

  const [nombre, setNombre] = useState(safe(nombreProp));

  const [departamentos, setDepartmentos] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(safe(departamentoProp));

  const [ciudades, setCiudades] = useState([]);
  const [selectedCity, setSelectedCity] = useState(safe(ciudadProp));

  const [direccion, setDireccion] = useState(safe(direccionProp));
  const [totalArea, setArea] = useState(safe(areaProp));

  const [managers, setManagers] = useState([])
  const [selectedManager, setSelectedManager] = useState(
    managerProp ? String(managerProp) : ""
  );

  const { flags, loading } = useFlags();
  const canAssignManager = flags.farm.assignManager;

  useEffect(() => {
    const token = localStorage.getItem("access")

    //MANAGERS
    if (canAssignManager) {
      fetch("https://backend-pongase-trucha.onrender.com/managers/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      })
        .then((res) => {
          if (!res.ok) throw new Error("Error al traer managers");
          return res.json();
        })
        .then((data) => {
          setManagers(data);
        })
        .catch((err) => console.error(err));
    }
  }, [canAssignManager]);

  useEffect(() => {
    const token = localStorage.getItem("access");

    fetch("https://backend-pongase-trucha.onrender.com/farm/departments/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setDepartmentos(data.departments))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access")
    if (selectedDepartment === "") return;
    //CIUDADES
    fetch(`https://backend-pongase-trucha.onrender.com/farm/departments/${selectedDepartment}/cities/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    }).then((res) => {
      if (!res.ok) throw new Error("Error al traer las ciudades");
      return res.json();
    }).then((data) => {
      setCiudades(data.cities);
    }).catch((err) => console.error(err));
  }, [selectedDepartment])

  const handleReset = () => {
    setNombre("")
    setSelectedDepartment("")
    setSelectedCity("")
    setDireccion("")
    setArea("")
    setSelectedManager("")
  }

  // VALIDATION
  const validate = () => {
    if (!nombre.trim()) {
      alert("El nombre no puede estar vacío.");
      return false;
    }
    if (!selectedDepartment) {
      alert("Debe seleccionar un departamento.");
      return false;
    }
    if (!selectedCity) {
      alert("Debe seleccionar una ciudad.");
      return false;
    }
    if (!direccion.trim()) {
      alert("La dirección no puede estar vacía.");
      return false;
    }
    const area = parseFloat(totalArea);
    if (isNaN(area) || area <= 0) {
      alert("El área total debe ser un número positivo válido.");
      return false;
    }
    if (!selectedManager && canAssignManager) {
      alert("Debe seleccionar un manager.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    if (!validate()) return;

    const token = localStorage.getItem("access")
    const payload = {
      name: nombre,
      department: selectedDepartment,
      city: selectedCity,
      address: direccion,
      total_area_ha: Number(totalArea),
    };

    if (canAssignManager) {
      payload.manager_id = Number(selectedManager);
    }
    try {
      const res = await fetch("https://backend-pongase-trucha.onrender.com/farm/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) window.location.reload();
    } catch (error) {
      console.error("Error en registro de granja:", error);
    }
  }

  const handleEdit = async (e) => {
    if (!validate()) return;

    const token = localStorage.getItem("access")
    const payload = {
      name: nombre,
      department: selectedDepartment,
      city: selectedCity,
      address: direccion,
      total_area_ha: Number(totalArea),
    };

    if (canAssignManager) {
      payload.manager_id = Number(selectedManager);
      payload.manager_name = managers.find(
        m => m.manager_id === Number(selectedManager)
      )?.name;
    }
    try {
      const res = await fetch(`https://backend-pongase-trucha.onrender.com/farm/${idProp}/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) window.location.reload();
    } catch (error) {
      console.error("Error en la edición de la granja:", error);
    }
  }

  if (loading) return null;

  return (
    <FieldGroup>
      {/* NAME */}
      <Field>
        <FieldLabel htmlFor="fieldgroup-name">Nombre</FieldLabel>
        <Input
          id="fieldgroup-name"
          placeholder="Fulano Detal"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)} />
      </Field>

      {/* DEPARTMENT */}
      <Field>
        <FieldLabel>Departamento</FieldLabel>
        <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
          <SelectTrigger>
            <SelectValue placeholder="Escoja un departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {departamentos.map((departamento) => (
                <SelectItem key={departamento.key} value={String(departamento.key)}>
                  {departamento.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      {/* CITY */}
      <Field>
        <FieldLabel>Ciudad</FieldLabel>
        <Select onValueChange={setSelectedCity} value={selectedCity}>
          <SelectTrigger>
            <SelectValue placeholder="Escoja una ciudad" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ciudades.map((ciudad) => (
                <SelectItem key={ciudad} value={ciudad}>
                  {ciudad}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      {/* ADDRESS */}
      <Field>
        <FieldLabel htmlFor="fieldgroup-address">Dirección</FieldLabel>
        <Input
          id="fieldgroup-address"
          placeholder="Cll x #y - z"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)} />
      </Field>

      {/* TOTAL AREA HA */}
      <Field>
        <FieldLabel htmlFor="fieldgroup-area">Área total en hectáreas</FieldLabel>
        <Input
          id="fieldgroup-area"
          type="number"
          placeholder="12.5"
          value={totalArea}
          onChange={(e) => setArea(e.target.value)} />
      </Field>

      {canAssignManager &&
        (<Field>
          <FieldLabel>Managers</FieldLabel>
          <Select onValueChange={setSelectedManager} value={selectedManager}>
            <SelectTrigger>
              <SelectValue placeholder="Escoja un manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {managers.map((manager) => (
                  <SelectItem key={manager.manager_id} value={String(manager.manager_id)}>
                    {manager.name} {manager.lastname}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>)
      }

      <Field orientation="horizontal">
        <Button onClick={handleReset}>Borrar</Button>
        <Button onClick={op === 1 ? handleSubmit : handleEdit}>Subir</Button>
      </Field>
    </FieldGroup>
  )
}