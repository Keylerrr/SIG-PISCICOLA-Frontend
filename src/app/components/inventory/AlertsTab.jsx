"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_BASE = "https://backend-pongase-trucha.onrender.com/api";

export function AlertsTab({ farmId }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${API_BASE}/farms/core/${farmId}/alerts/?is_resolved=false`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching alerts:", err);
      toast.error("Error al cargar alertas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (farmId) fetchData();
  }, [farmId]);

  const handleResolve = async (id) => {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${API_BASE}/farms/core/${farmId}/alerts/${id}/resolve/`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({})
      });

      if (!res.ok) throw new Error("Error al resolver la alerta");
      
      toast.success("Alerta marcada como resuelta");
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div className="py-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600"/></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Alertas de Inventario</h2>
        <p className="text-sm text-slate-500">Revisa las notificaciones sobre stock bajo o problemas en la granja.</p>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">Todo en orden</h3>
          <p className="text-slate-500">No hay alertas activas en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-700 flex items-start gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                  {alert.title || "Alerta de Sistema"}
                </CardTitle>
                <CardDescription className="text-red-600/80">
                  {new Date(alert.created_at || alert.date).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <div className="px-6 py-2 text-slate-700 text-sm">
                {alert.message || alert.description || "Se requiere atención en el inventario o granja."}
              </div>
              <CardFooter className="pt-4">
                <Button 
                  onClick={() => handleResolve(alert.id)}
                  variant="outline" 
                  className="w-full border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Marcar como resuelta
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
