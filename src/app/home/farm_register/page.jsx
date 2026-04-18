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


export default function FarmRegisterPage() {
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
    fetch("https://backend-pongase-trucha.onrender.com/farm/departments",{
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    }).then((res) => {
      if (!res.ok) throw new Error("Error al traer departamentos");
        return res.json();
    }).then((data) => {
      setDepartmentos(data);
    }).catch((err) => console.error(err));
  }, []);
  
  useEffect(() => {
    const token = localStorage.getItem("access")
    //CIUDADES
    fetch(`http://backend-pongase-trucha.onrender.com/farm/departments/${selectedDepartment}`,{
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    }).then((res) => {
      if (!res.ok) throw new Error("Error al traer las ciudades");
        return res.json();
    }).then((data) => {
      setCiudades(data);
    }).catch((err) => console.error(err));
  }, [selectedDepartment])

  const handleReset = (e) => {
    setNombre("")
    setSelectedDepartment("")
    setSelectedCity("")
    setDireccion("")
    setArea("")
    setSelectedManager("")
  }

  const handleSubmit = async (e) => {
    const token = localStorage.getItem("access")
    try {
      console.log("aca estamos")
      const res = await fetch("https://backend-pongase-trucha.onrender.com/farm/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: nombre,
          department: Number(selectedDepartment),
          city: Number(selectedCity),
          address: direccion,
          total_area_ha: totalArea,
          manager_id: Number(selectedManager)
        })
      });
      const data = await res.json();

      if (!res.ok) console.log("Error:", data);
      else handleReset(e);
    } catch (error) {
      console.error("Error en recuperación:", error);
    }
  }
  return (
    <FieldGroup className="px-15 py-10">
      {/* NAME */}
      <Field>
        <FieldLabel htmlFor="fieldgroup-name">Name</FieldLabel>
        <Input 
        required
        id="fieldgroup-name" 
        placeholder="Fulano Detal"
        onChange={(e) => setNombre(e.target.value)}
        value={nombre}/>
      </Field>

      {/* DEPARTMENT */}
      <Field>
        <FieldLabel>Managers</FieldLabel>
        <Select onValueChange={setSelectedDepartment} value={selectedManager}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a department" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {departamentos.map((departamento) => (
              <SelectItem key={departamento.id} value={String(departamento.id)}>
                {departamento.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      </Field>

      {/* CITY */}
      <Field>
        <FieldLabel>Managers</FieldLabel>
        <Select onValueChange={setSelectedCity} value={selectedCity}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a city" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {ciudades.map((ciudad) => (
              <SelectItem key={ciudad.id} value={String(ciudad.id)}>
                {ciudad.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      </Field>

      {/* ADDRESS */}
      <Field>
        <FieldLabel htmlFor="fieldgroup-address">Address</FieldLabel>
        <Input
          required
          id="fieldgroup-address"
          placeholder="Cll x #y - z"
          onChange={(e) => setDireccion(e.target.value)}
          value={direccion}/>
      </Field>

      {/* TOTAL AREA HA */}
      <Field>
        <FieldLabel htmlFor="fieldgroup-area">Total Area</FieldLabel>
        <Input
          id="fieldgroup-area"
          type="number"
          placeholder="12.5"
          onChange={(e) => setArea(e.target.value)}
          value={totalArea}/>
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
              <SelectItem key={manager.id} value={String(manager.id)}>
                {manager.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      </Field>

      <Field orientation="horizontal">
        <Button onClick={handleReset}> Reset </Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </Field>
    </FieldGroup>
  )
}