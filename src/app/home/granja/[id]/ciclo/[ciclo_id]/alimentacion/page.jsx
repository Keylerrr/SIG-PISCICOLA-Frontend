"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "sonner";
import { feedingService } from "@/lib/feedingService";
import { usePermissions } from "@/lib/usePermissions";
import { FeedingPlanForm } from "@/app/home/granja/[id]/ciclo/[ciclo_id]/alimentacion/feeding_plan_form";

const STATE_COLORS = {
  scheduled: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  finished: "bg-green-100 text-green-700",
  archived: "bg-rose-100 text-rose-700",
};

const STATE_LABELS = {
  scheduled: "Programado",
  in_progress: "En curso",
  finished: "Finalizado",
  archived: "Archivado",
};

export default function CycleFeeding({ params }) {
  const { id, ciclo_id } = use(params);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const permissions = usePermissions(id);

  const canManage = permissions.canManageCycle;

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await feedingService.getCycleFeedingPlans(id, ciclo_id);
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.status === 404) {
        setPlans([]);
        return;
      }
      console.error("Error cargando planes de alimentación:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (permissions.loading) return;
    if (!permissions.isFarmMember && !permissions.canManageCycle && !permissions.isAdmin) return;
    fetchPlans();
  }, [id, ciclo_id, permissions.loading, permissions.isFarmMember, permissions.canManageCycle, permissions.isAdmin]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href={`/home/granja/${id}/ciclo/${ciclo_id}/`} className="text-slate-600 hover:text-slate-800 inline-flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Volver al ciclo
            </Link>
            <h1 className="mt-4 text-4xl font-bold">Planes de alimentación</h1>
            <p className="text-slate-600 mt-2">Planes asociados al ciclo seleccionado.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canManage && (
              <Button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Nuevo plan
              </Button>
            )}
          </div>
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex justify-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" /> Cargando planes...
            </div>
          </div>
        )}

        {!loading && plans.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center text-slate-600 shadow-sm">
            No hay planes de alimentación para este ciclo.
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id} className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Plan #{plan.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">
                  Cronograma: {(plan.feeding_schedule_name ?? plan.feeding_schedule) || "—"}
                </p>
                <p className="text-sm text-slate-600">Inicio: {plan.start_date || "—"}</p>
                <p className="text-sm text-slate-600">Fin: {plan.end_date || "—"}</p>
                <p className="text-sm text-slate-600">Ciclo: {plan.cycle || "—"}</p>
              </CardContent>
              <CardFooter className="flex flex-wrap items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATE_COLORS[plan.state] || "bg-slate-100 text-slate-700"}`}>
                  {STATE_LABELS[plan.state] || plan.state || "Desconocido"}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/home/granja/${id}/ciclo/${ciclo_id}/alimentacion/${plan.id}`} className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Ver plan
                  </Link>
                  <Link href={`/home/granja/${id}/alimentacion/${plan.feeding_schedule}/`} className="text-blue-600 hover:underline">
                    Ver cronograma
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {showCreate && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Crear plan de alimentación</h2>
                <p className="text-slate-600">Registra un plan nuevo y valida solapamientos para este ciclo.</p>
              </div>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cerrar
              </Button>
            </div>
            <FeedingPlanForm
              farmId={id}
              cycleId={ciclo_id}
              onSuccess={() => {
                setShowCreate(false);
                fetchPlans();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
