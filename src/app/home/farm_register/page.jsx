'use client';

import { useState } from 'react';

export default function FarmRegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    propietario: '',
    departamento: '',
    municipio: '',
    vereda: '',
    coordenadas: '',
    areaTotal: '',
    descripcion: '',
    activa: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implementar la conexión con el endpoint de la base de datos para hacer POST
    // Ejemplo: const response = await fetch('/api/farms', { method: 'POST', body: JSON.stringify(formData) });
    console.log('Datos a enviar:', formData);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registro de Granja</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label htmlFor="nit" className="block text-sm font-medium">NIT</label>
          <input
            type="text"
            id="nit"
            name="nit"
            value={formData.nit}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label htmlFor="propietario" className="block text-sm font-medium">Propietario</label>
          <input
            type="text"
            id="propietario"
            name="propietario"
            value={formData.propietario}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label htmlFor="departamento" className="block text-sm font-medium">Departamento</label>
          <input
            type="text"
            id="departamento"
            name="departamento"
            value={formData.departamento}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label htmlFor="municipio" className="block text-sm font-medium">Municipio</label>
          <input
            type="text"
            id="municipio"
            name="municipio"
            value={formData.municipio}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label htmlFor="vereda" className="block text-sm font-medium">Vereda</label>
          <input
            type="text"
            id="vereda"
            name="vereda"
            value={formData.vereda}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label htmlFor="coordenadas" className="block text-sm font-medium">Coordenadas</label>
          <input
            type="text"
            id="coordenadas"
            name="coordenadas"
            value={formData.coordenadas}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label htmlFor="areaTotal" className="block text-sm font-medium">Área Total (Hectáreas)</label>
          <input
            type="number"
            id="areaTotal"
            name="areaTotal"
            value={formData.areaTotal}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="activa"
              checked={formData.activa}
              onChange={handleChange}
              className="mr-2"
            />
            Activa
          </label>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Registrar Granja
        </button>
      </form>
    </div>
  );
}