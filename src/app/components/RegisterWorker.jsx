"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useFlags } from "@/hooks/useFlags";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";

export function RegisterWorker() {
  const [workers, setWorkers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userRole, setUserRole] = useState(null); // 👈 Para saber si es Admin o Productor

  const { flags, loading } = useFlags();
  const canAssignManager = flags?.users?.assignManager;

  const [correo, setCorreo] = useState("");
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState("");
  
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");

  const [open, setOpen] = useState(false);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);

  // 🔥 1. Obtener perfil del usuario logueado (PRIMERO)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;

      try {
        const res = await fetch("https://backend-pongase-trucha.onrender.com/api/users/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.id);
          setUserRole(data.role?.name); // 👈 Guardar rol: "Admin" o "Productor"
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // 🔥 2. TRAER MANAGERS (solo si es Admin)
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
      .then((data) => setManagers(data))
      .catch(console.error);
  }, [canAssignManager]);

  // 🔥 3. TRAER GRANJAS
  useEffect(() => {
    if (loading) return;

    const fetchFarms = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;

      try {
        let url = "https://backend-pongase-trucha.onrender.com/api/farms/";

        if (canAssignManager) {
          if (!selectedManager) {
            setFarms([]);
            return;
          }
          url = `https://backend-pongase-trucha.onrender.com/api/farms/productor/${selectedManager}/`;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error("Error al traer granjas");
        
        const data = await res.json();
        setFarms(data);
      } catch (err) {
        console.error("Error cargando granjas:", err);
      }
    };

    fetchFarms();
  }, [loading, canAssignManager, selectedManager]);

  // 🔥 4. FUNCIÓN AUXILIAR: Obtener operarios vía granjas + miembros (para Productor)
  const fetchWorkersViaFarms = useCallback(async (token, productorId) => {
    try {
      // Obtener granjas donde este productor es dueño
      const farmsRes = await fetch(
        `https://backend-pongase-trucha.onrender.com/api/farms/productor/${productorId}/`,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (!farmsRes.ok) {
        // Si no puede acceder al endpoint de farms por productor, intentar endpoint genérico
        const farmsResAlt = await fetch(
          "https://backend-pongase-trucha.onrender.com/api/farms/",
          { headers: { Authorization: `Bearer ${token}` }}
        );
        if (!farmsResAlt.ok) throw new Error("Error al cargar granjas");
        var farms = await farmsResAlt.json();
        // Filtrar solo las granjas donde el usuario es owner (si el backend lo indica)
        // Si no hay campo is_owner, asumimos que el backend ya filtró por permisos
      } else {
        var farms = await farmsRes.json();
      }

      // Para cada granja, obtener sus miembros
      const allOperarios = [];
      const seenUsers = new Set(); // Evitar duplicados

      for (const farm of farms) {
        const membersRes = await fetch(
          `https://backend-pongase-trucha.onrender.com/api/farms/${farm.id}/members/`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        if (membersRes.ok) {
          const members = await membersRes.json();
          // Filtrar solo operarios (excluir al dueño) y activos
          for (const m of members) {
            if (!m.is_owner && m.status === "active" && !seenUsers.has(m.user?.id)) {
              seenUsers.add(m.user?.id);
              // Normalizar estructura para que coincida con el render
              allOperarios.push({
                worker_id: m.user?.id,
                id: m.user?.id,
                name: m.user?.name || "",
                lastname: m.user?.lastname || "",
                email: m.user?.email || "",
                phone: m.user?.phone || "",
                farm_id: farm.id,
                farm_name: farm.name,
              });
            }
          }
        }
      }

      return allOperarios;
    } catch (err) {
      console.error("Error en fetchWorkersViaFarms:", err);
      throw err;
    }
  }, []);

  // 🔥 5. FUNCIÓN PRINCIPAL: TRAER WORKERS
  const fetchWorkers = useCallback(async (productorId = null) => {
    const token = localStorage.getItem("access");
    if (!token) return;

    setIsLoadingWorkers(true);

    try {
      // Determinar qué ID usar: seleccionado o el usuario actual
      const idToUse = productorId || currentUserId;
      
      // Si no tenemos ID, no podemos filtrar
      if (!idToUse) {
        setWorkers([]);
        return;
      }

      let workersData = [];

      // 🎯 FLUJO SEGÚN ROL
      if (userRole === "Admin") {
        // Admin: puede usar el endpoint directo de operarios por productor
        const url = `https://backend-pongase-trucha.onrender.com/api/users/productor/${idToUse}/operarios/`;
        
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.clone().json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.message || "Error al cargar operarios");
        }

        workersData = await res.json();
        
      } else {
        // Productor: usar fallback vía granjas + miembros
        workersData = await fetchWorkersViaFarms(token, idToUse);
      }

      // Normalizar datos para el render (asegurar campos)
      const normalized = workersData.map((w) => ({
        worker_id: w.id || w.worker_id || w.user?.id,
        id: w.id || w.worker_id || w.user?.id,
        name: w.name || w.user?.name || "",
        lastname: w.lastname || w.user?.lastname || "",
        email: w.email || w.user?.email || "",
        phone: w.phone || w.user?.phone || "",
        farm_id: w.farm_id,
        farm_name: w.farm_name,
      }));

      setWorkers(normalized);

    } catch (err) {
      console.error("Error en fetchWorkers:", err);
      toast.error(err.message || "Error cargando trabajadores");
      setWorkers([]); // Limpiar en caso de error
    } finally {
      setIsLoadingWorkers(false);
    }
  }, [currentUserId, userRole, fetchWorkersViaFarms]);

  // 🔥 6. Cargar workers cuando tengamos el usuario y rol
  useEffect(() => {
    if (currentUserId && userRole && !loading) {
      fetchWorkers(selectedManager);
    }
  }, [currentUserId, userRole, loading, selectedManager, fetchWorkers]);

  // 🔥 7. Recargar al cambiar de manager seleccionado
  useEffect(() => {
    if (currentUserId && userRole && selectedManager) {
      fetchWorkers(selectedManager);
    }
  }, [selectedManager, currentUserId, userRole, fetchWorkers]);

  // 🔥 8. HANDLER: Submit de invitación
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo || !selectedFarm) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    const token = localStorage.getItem("access");

    await toast.promise(
      fetch("https://backend-pongase-trucha.onrender.com/api/invitations/operario/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: correo,
          farm_id: Number(selectedFarm),
        }),
      }).then(async (res) => {
        let data = null;
        try {
          data = await res.json();
        } catch { }

        if (!res.ok) {
          const errorMsg = data?.detail || data?.message || data?.non_field_errors?.[0] || "Error al enviar invitación";
          throw new Error(errorMsg);
        }

        // Recargar lista de operarios
        await fetchWorkers(selectedManager);

        return data;
      }),
      {
        loading: "Creando trabajador...",
        success: () => {
          setCorreo("");
          setSelectedFarm("");
          setOpen(false);
          return "Invitación enviada";
        },
        error: (err) => err.message || "Error al guardar",
      }
    );
  };

  // 🔥 9. Handler para cerrar modal
  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      setCorreo("");
      setSelectedManager("");
      setSelectedFarm("");
    }
  };

  // 🔥 10. Render condicional mientras carga
  if (loading || (!currentUserId && !userRole)) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Gestión de Trabajadores</h1>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors">
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Trabajador</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <FieldGroup>
                <Field>
                  <Label>Correo del Operario</Label>
                  <Input
                    type="email"
                    placeholder="correo@correo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                  />
                </Field>

                {canAssignManager && (
                  <Field>
                    <Label>Productor</Label>
                    <Select 
                      onValueChange={(val) => {
                        setSelectedManager(val);
                        setSelectedFarm("");
                      }} 
                      value={selectedManager} 
                      required={canAssignManager}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un productor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {managers.map((m) => (
                            <SelectItem key={m.id} value={String(m.id)}>
                              {m.name} {m.lastname}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                <Field>
                  <Label>Granja Asociada</Label>
                  <Select 
                    onValueChange={setSelectedFarm} 
                    value={selectedFarm} 
                    required
                    disabled={canAssignManager && !selectedManager}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una granja" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {farms.length === 0 ? (
                          <SelectItem value="no-farms" disabled>
                            Sin granjas disponibles
                          </SelectItem>
                        ) : (
                          farms.map((f) => (
                            <SelectItem key={f.id} value={String(f.id)}>
                              {f.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoadingWorkers}>
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* LISTA DE TRABAJADORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoadingWorkers ? (
          <p className="text-gray-500 col-span-full text-center">Cargando operarios...</p>
        ) : workers.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center">
            {canAssignManager && !selectedManager 
              ? "Seleccione un productor para ver sus operarios" 
              : "No hay operarios registrados"}
          </p>
        ) : (
          workers.map((w) => (
            <div 
              key={w.worker_id || w.id} 
              className="border rounded-lg p-4 group border border-gray-200 hover:border-cyan-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <p className="font-bold group-hover:text-cyan-500">
                {w.name} {w.lastname}
              </p>
              <p className="text-sm text-gray-500">{w.email}</p>
              {w.phone && <p className="text-sm">{w.phone}</p>}
              {w.farm_name && (
                <p className="text-xs text-cyan-600 mt-1">📍 {w.farm_name}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}