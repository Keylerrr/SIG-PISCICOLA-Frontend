'use client';

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


export function FarmRegisterForm() {
  const[nombre,setNombre]=useState("");

  const[departamentos,setDepartmentos]=useState([]);
  const[selectedDepartment, setSelectedDepartment] = useState("");

  const[ciudades,setCiudades]=useState([]);
  const[selectedCity, setSelectedCity] = useState("");

  const[direccion,setDireccion]=useState("");
  const[totalArea,setArea]=useState("");

  const[managers,setManagers]=useState([])
  const[selectedManager, setSelectedManager] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access")

    //MANAGERS
    fetch("https://backend-pongase-trucha.onrender.com/managers/",{
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    }).then((res) => {
      if (!res.ok) throw new Error("Error al traer managers");
        return res.json();
    }).then((data) => {
      setManagers(data);
    }).catch((err) => console.error(err));

    //DEPARTAMENTOS
    fetch("https://backend-pongase-trucha.onrender.com/farm/departments/",{
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    }).then((res) => {
      if (!res.ok) throw new Error("Error al traer departamentos");
        return res.json();
    }).then((data) => {
      setDepartmentos(data.departments);
      console.log(data)
    }).catch((err) => console.error(err));
  }, []);
  
  useEffect(() => {
    const token = localStorage.getItem("access")
    if(selectedDepartment === "") return;
    //CIUDADES
    fetch(`https://backend-pongase-trucha.onrender.com/farm/departments/${selectedDepartment}/cities/`,{
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access")
    try {
      console.log("aca estamos")
      const res = await fetch("https://backend-pongase-trucha.onrender.com/farm/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: nombre,
          department: selectedDepartment,
          city: selectedCity,
          address: direccion,
          total_area_ha: Number(totalArea),
          manager_id: Number(selectedManager),
        })
      });
      if (res.ok) {
        handleReset();
        window.location.reload();
      }
    } catch (error) {
      console.error("Error en registro de granja:", error);
    }
  }
  return (
    <FieldGroup>
      {/* NAME */}
      <Field>
        <FieldLabel htmlFor="fieldgroup-name">Nombre</FieldLabel>
        <Input 
        id="fieldgroup-name" 
        placeholder="Fulano Detal"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}/>
      </Field>

      {/* DEPARTMENT */}
      <Field>
        <FieldLabel>Departamento</FieldLabel>
        <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a department" />
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
          <SelectValue placeholder="Choose a city" />
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
          onChange={(e) => setDireccion(e.target.value)}/>
      </Field>

      {/* TOTAL AREA HA */}
      <Field>
        <FieldLabel htmlFor="fieldgroup-area">Área total en hectáreas</FieldLabel>
        <Input
          id="fieldgroup-area"
          type="number"
          placeholder="12.5"
          value={totalArea}
          onChange={(e) => setArea(e.target.value)}/>
      </Field>

      {/* MANAGER ID */}
      <Field>
        <FieldLabel>Managers</FieldLabel>
        <Select onValueChange={setSelectedManager} value={selectedManager}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a manager" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {managers.map((manager) => (
              <SelectItem key={manager.manager_id} value={manager.manager_id}>
                {manager.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      </Field>

      <Field orientation="horizontal">
        <Button onClick={handleReset}>Borrar</Button>
        <Button onClick={handleSubmit}>Subir</Button>
      </Field>
    </FieldGroup>
  )
}