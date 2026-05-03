"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { ArrowLeft, UserCog, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

export default function GranjaUsuarios({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [workers, setWorkers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const [openRole, setOpenRole] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState([]);

  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("access"));
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await fetch(
        `https://backend-pongase-trucha.onrender.com/api/farms/${id}/members/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setWorkers(data);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando trabajadores");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(
        `https://backend-pongase-trucha.onrender.com/api/farms/${id}/roles/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando roles");
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchWorkers();
    fetchRoles();
  }, [token]);

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    await toast.promise(
      fetch(
        `https://backend-pongase-trucha.onrender.com/api/farms/${id}/members/${selectedUser}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            farm_role: Number(selectedRole),
          }),
        }
      ).then(async (res) => {
        if (!res.ok) throw new Error("Error asignando rol");
        await fetchWorkers();
      }),
      {
        loading: "Asignando rol...",
        success: "Rol actualizado",
        error: "Error",
      }
    );
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();

    if (!roleName) {
      toast.error("El nombre es obligatorio");
      return;
    }

    await toast.promise(
      fetch(`https://backend-pongase-trucha.onrender.com/api/farms/${id}/roles/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: roleName,
          permissions: permissions,
        }),
      }).then(async (res) => {
        if (!res.ok) throw new Error("Error creando rol");

        setRoleName("");
        setPermissions([]);
        setOpenRole(false);
        await fetchRoles();
      }),
      {
        loading: "Creando rol...",
        success: "Rol creado",
        error: "Error",
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      
      {/* VOLVER */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a la Vista de Estanques
      </button>

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Trabajadores</h1>

        {/* CREAR ROL */}
        <Dialog open={openRole} onOpenChange={setOpenRole}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-[#6ec3b1] text-white">
              <Plus className="w-4 h-4" />
              Crear Rol
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Rol</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateRole} className="space-y-4 mt-4">
              <Input
                placeholder="Nombre del rol"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              />

              <div className="space-y-2 text-sm">
                {["VIEW", "EDIT", "DELETE", "MANAGE_USERS", "MANAGE_ROLES"].map((perm) => (
                  <label key={perm} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={permissions.includes(perm)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPermissions([...permissions, perm]);
                        } else {
                          setPermissions(permissions.filter(p => p !== perm));
                        }
                      }}
                    />
                    {perm}
                  </label>
                ))}
              </div>

              <Button type="submit" className="w-full">
                Crear
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow p-4">
        {workers.length === 0 ? (
          <p className="text-gray-500">No hay trabajadores</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {workers
                .filter(w => !w.is_owner)
                .map((w) => (
                  <tr key={w.user.id} className="border-b">
                    <td>{w.user.name} {w.user.lastname}</td>
                    <td>{w.user.email}</td>
                    <td>
                      {roles.find(r => r.id === w.farm_role)?.name || "Sin rol"}
                    </td>
                    <td>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedUser(w.user.id)}
                          >
                            <UserCog className="w-4 h-4 mr-1" />
                            Asignar
                          </Button>
                        </DialogTrigger>

                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Asignar Rol</DialogTitle>
                          </DialogHeader>

                          <Select onValueChange={setSelectedRole}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona rol" />
                            </SelectTrigger>

                            <SelectContent>
                              {roles.map((r) => (
                                <SelectItem key={r.id} value={String(r.id)}>
                                  {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button className="mt-4" onClick={handleAssignRole}>
                            Guardar
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}