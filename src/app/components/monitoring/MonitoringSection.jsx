"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ListFilter } from "lucide-react";
import { toast } from "sonner";
import { MonitoringStatsCards } from "./MonitoringStatsCards";
import { BiometricsSamplingForm } from "./BiometricsSamplingForm";

const API_BASE = "https://backend-pongase-trucha.onrender.com/api";

export function MonitoringSection({ farmId, pondId, cycleId }) {
    const [currentState, setCurrentState] = useState(null);
    const [latestControlStat, setLatestControlStat] = useState(null);
    const [evaluations, setEvaluations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("access");
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };

            const baseCycleUrl = `${API_BASE}/farms/${farmId}/ponds/${pondId}/cycles/${cycleId}`;

            // Fetch Current State
            const stateRes = await fetch(`${baseCycleUrl}/current_state/`, { headers });
            if (stateRes.ok) {
                setCurrentState(await stateRes.json());
            } else {
                console.warn("Could not fetch current_state");
            }

            // Fetch Control Stats (get the latest one)
            const controlStatsRes = await fetch(`${baseCycleUrl}/control-stats/`, { headers });
            if (controlStatsRes.ok) {
                const statsList = await controlStatsRes.json();
                if (statsList.length > 0) {
                    // Assuming they might be sorted by date, or we sort them
                    statsList.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setLatestControlStat(statsList[0]);
                } else {
                    setLatestControlStat(null);
                }
            }

            // Fetch Evaluations
            const evalRes = await fetch(`${baseCycleUrl}/fish-evaluations/`, { headers });
            if (evalRes.ok) {
                const evalsList = await evalRes.json();
                // Sort by date descending
                evalsList.sort((a, b) => new Date(b.evaluation_date) - new Date(a.evaluation_date));
                setEvaluations(evalsList);
            }

        } catch (err) {
            console.error("Error fetching monitoring data:", err);
            setError("Error al cargar los datos de monitoreo.");
        } finally {
            setIsLoading(false);
        }
    }, [farmId, pondId, cycleId]);

    useEffect(() => {
        if (farmId && pondId && cycleId) {
            fetchData();
        }
    }, [fetchData, farmId, pondId, cycleId]);

    const handleFormSuccess = () => {
        setIsModalOpen(false);
        toast.success("Evaluación registrada con éxito. Las métricas se han actualizado.");
        fetchData();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Monitoreo</h2>
                    <p className="text-sm text-slate-500">Métricas actuales y registro de muestreos biométricos</p>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            <span>Registrar Muestreo</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Nuevo Muestreo Biométrico</DialogTitle>
                        </DialogHeader>
                        <BiometricsSamplingForm
                            farmId={farmId}
                            pondId={pondId}
                            cycleId={cycleId}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
                    {error}
                </div>
            )}

            <MonitoringStatsCards
                currentState={currentState}
                latestControlStat={latestControlStat}
                isLoading={isLoading}
            />

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2 text-slate-800 font-medium">
                    <ListFilter className="w-4 h-4 text-slate-500" />
                    Últimas Evaluaciones
                </div>
                
                {isLoading ? (
                    <div className="p-8 text-center text-slate-400">Cargando evaluaciones...</div>
                ) : evaluations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 italic">No hay evaluaciones registradas en este ciclo.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Fecha</th>
                                    <th className="px-6 py-3 font-medium">Muestra</th>
                                    <th className="px-6 py-3 font-medium">Mortalidad</th>
                                    <th className="px-6 py-3 font-medium">Peso Prom. (g)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {evaluations.slice(0, 5).map((ev) => (
                                    <tr key={ev.id || ev.evaluation_date} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {ev.evaluation_date}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {ev.sampled_quantity} peces
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <span className={ev.mortality_quantity > 0 ? "text-red-600 font-medium" : ""}>
                                                {ev.mortality_quantity} peces
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {ev.avg_weight_g} g
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
