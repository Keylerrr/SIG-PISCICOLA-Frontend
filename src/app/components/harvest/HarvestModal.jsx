"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Fish, Scale, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const API_BASE = "https://backend-pongase-trucha.onrender.com/api";

const SIZE_CATEGORIES = ["Small", "Medium", "Large", "Extra Large"];

const SIZE_CATEGORY_LABELS = {
    Small: "Pequeño",
    Medium: "Mediano",
    Large: "Grande",
    "Extra Large": "Extra Grande",
};

const EMPTY_CLASSIFICATION = () => ({
    size_category: "",
    fish_count: "",
    total_weight_g: "",
});

/**
 * Recursively extracts API error messages from a Django REST Framework error response.
 */
function extractApiErrors(data) {
    if (!data || typeof data !== "object") return ["Error desconocido del servidor."];
    const messages = [];

    const process = (obj, prefix = "") => {
        for (const [key, value] of Object.entries(obj)) {
            const fieldLabel = prefix ? `${prefix} → ${key}` : key;
            if (Array.isArray(value)) {
                value.forEach((v, idx) => {
                    if (typeof v === "string") {
                        messages.push(`${fieldLabel}: ${v}`);
                    } else if (typeof v === "object" && v !== null) {
                        // nested object inside array (e.g. classifications[i])
                        process(v, `${fieldLabel}[${idx + 1}]`);
                    }
                });
            } else if (typeof value === "string") {
                messages.push(`${fieldLabel}: ${value}`);
            } else if (typeof value === "object" && value !== null) {
                process(value, fieldLabel);
            }
        }
    };

    process(data);
    return messages.length > 0 ? messages : ["Error al procesar la solicitud."];
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

function HarvestTypeSelector({ value, onChange }) {
    const options = [
        {
            id: "total",
            label: "Cosecha Total",
            desc: "Cosechar todo el stock disponible del ciclo. El backend infiere automáticamente el conteo y peso total.",
            icon: "🐟",
            color: "emerald",
        },
        {
            id: "partial",
            label: "Cosecha Parcial",
            desc: "Cosechar una parte del stock. Debes indicar la cantidad total de peces a cosechar.",
            icon: "🎣",
            color: "blue",
        },
    ];

    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tipo de cosecha <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map(({ id, label, desc, icon, color }) => {
                    const isSelected = value === id;
                    const borderColor =
                        isSelected
                            ? color === "emerald"
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-blue-500 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50";

                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onChange(id)}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${borderColor}`}
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                {/* Radio dot */}
                                <span
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                        isSelected
                                            ? color === "emerald"
                                                ? "border-emerald-500"
                                                : "border-blue-500"
                                            : "border-slate-300"
                                    }`}
                                >
                                    {isSelected && (
                                        <span
                                            className={`w-2 h-2 rounded-full ${
                                                color === "emerald" ? "bg-emerald-500" : "bg-blue-500"
                                            }`}
                                        />
                                    )}
                                </span>
                                <span className="text-base">{icon}</span>
                                <span className="font-semibold text-sm text-slate-800">{label}</span>
                            </div>
                            <p className="text-xs text-slate-500 ml-6 leading-relaxed">{desc}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function TotalHarvestInfoBanner() {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700 leading-relaxed">
                <span className="font-semibold">Cosecha total:</span> el backend calculará automáticamente
                la cantidad de peces y el peso total basándose en el stock vivo del ciclo. Si el stock
                se agota, el ciclo quedará marcado como{" "}
                <span className="font-semibold">Completado</span> automáticamente.
            </p>
        </div>
    );
}

function ClassificationRow({ cls, index, total, onChange, onRemove }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Clasificación {index + 1}
                </span>
                {total > 1 && (
                    <button
                        type="button"
                        onClick={onRemove}
                        title="Eliminar clasificación"
                        className="text-slate-400 hover:text-rose-600 transition-colors rounded-md p-0.5 hover:bg-rose-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Size category */}
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                        Categoría <span className="text-rose-500">*</span>
                    </label>
                    <select
                        required
                        value={cls.size_category}
                        onChange={(e) => onChange("size_category", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
                    >
                        <option value="">Seleccionar...</option>
                        {SIZE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat} — {SIZE_CATEGORY_LABELS[cat]}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Fish count */}
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                        Cantidad de peces <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="number"
                        min="1"
                        required
                        placeholder="0"
                        value={cls.fish_count}
                        onChange={(e) => onChange("fish_count", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
                    />
                </div>
                {/* Total weight */}
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                        Peso total (g) <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={cls.total_weight_g}
                        onChange={(e) => onChange("total_weight_g", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
                    />
                </div>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────────

export function HarvestModal({ open, onOpenChange, ciclo, farmId, onSuccess }) {
    const [harvestType, setHarvestType] = useState("total");
    const [date, setDate] = useState("");
    const [totalFishCount, setTotalFishCount] = useState("");
    const [observations, setObservations] = useState("");
    const [classifications, setClassifications] = useState([EMPTY_CLASSIFICATION()]);
    const [submitting, setSubmitting] = useState(false);

    // Set today's date as default when modal opens
    useEffect(() => {
        if (open) {
            setDate(new Date().toISOString().split("T")[0]);
        }
    }, [open]);

    const resetForm = () => {
        setHarvestType("total");
        setDate(new Date().toISOString().split("T")[0]);
        setTotalFishCount("");
        setObservations("");
        setClassifications([EMPTY_CLASSIFICATION()]);
    };

    const handleClose = () => {
        if (submitting) return;
        resetForm();
        onOpenChange(false);
    };

    // ── Classification helpers ────────────────────────────────────────────────

    const addClassification = () => {
        setClassifications((prev) => [...prev, EMPTY_CLASSIFICATION()]);
    };

    const removeClassification = (index) => {
        setClassifications((prev) => prev.filter((_, i) => i !== index));
    };

    const updateClassification = (index, field, value) => {
        setClassifications((prev) =>
            prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
        );
    };

    // ── Validation ────────────────────────────────────────────────────────────

    const validate = () => {
        if (!date) {
            toast.error("La fecha de cosecha es obligatoria.");
            return false;
        }

        if (harvestType === "partial") {
            const count = Number(totalFishCount);
            if (!totalFishCount || isNaN(count) || count <= 0) {
                toast.error("La cantidad total de peces cosechados debe ser mayor a 0.");
                return false;
            }
        }

        if (classifications.length === 0) {
            toast.error("Debe agregar al menos una clasificación comercial.");
            return false;
        }

        for (let i = 0; i < classifications.length; i++) {
            const c = classifications[i];
            if (!c.size_category) {
                toast.error(`Clasificación ${i + 1}: la categoría de tamaño es obligatoria.`);
                return false;
            }
            const fc = Number(c.fish_count);
            if (!c.fish_count || isNaN(fc) || fc <= 0) {
                toast.error(`Clasificación ${i + 1}: la cantidad de peces debe ser mayor a 0.`);
                return false;
            }
            const tw = Number(c.total_weight_g);
            if (!c.total_weight_g || isNaN(tw) || tw <= 0) {
                toast.error(`Clasificación ${i + 1}: el peso total debe ser mayor a 0.`);
                return false;
            }
        }

        return true;
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem("access");

            // Build payload — only send what the spec requires
            const payload = {
                cycle: ciclo.id,
                date,
                classifications: classifications.map((c) => ({
                    size_category: c.size_category,
                    fish_count: Number(c.fish_count),
                    total_weight_g: Number(c.total_weight_g),
                })),
            };

            // Optional fields
            if (observations.trim()) {
                payload.observations = observations.trim();
            }

            // For partial harvest include total_fish_count; DO NOT send type
            if (harvestType === "partial") {
                payload.total_fish_count = Number(totalFishCount);
            }

            // For total harvest: omit total_fish_count, total_weight_g, and type
            // Backend will infer them automatically

            const res = await fetch(`${API_BASE}/farms/${farmId}/harvests/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success("Cosecha registrada correctamente.");
                resetForm();
                onOpenChange(false);
                // Refresh cycle data (handles finished-cycle state automatically)
                onSuccess();
            } else {
                const errorData = await res.json().catch(() => ({}));
                const messages = extractApiErrors(errorData);
                messages.slice(0, 5).forEach((msg) => toast.error(msg));
            }
        } catch (err) {
            toast.error(err.message || "Error de conexión al registrar la cosecha.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const cycleStartDate = ciclo?.start_date ?? undefined;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="max-w-2xl w-full max-h-[92vh] overflow-y-auto"
                showCloseButton={!submitting}
            >
                {/* ── Header ── */}
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                            <Fish className="w-4 h-4 text-emerald-600" />
                        </span>
                        Registrar Cosecha
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Ciclo:{" "}
                        <span className="font-semibold text-slate-700">{ciclo?.name}</span>
                    </DialogDescription>
                </DialogHeader>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="space-y-5 py-1">
                    {/* Harvest type */}
                    <HarvestTypeSelector value={harvestType} onChange={setHarvestType} />

                    {/* Info banner for total */}
                    {harvestType === "total" && <TotalHarvestInfoBanner />}

                    {/* ── Date ── */}
                    <div>
                        <label
                            htmlFor="harvest-date"
                            className="block text-sm font-semibold text-slate-700 mb-1"
                        >
                            Fecha de cosecha <span className="text-rose-500">*</span>
                        </label>
                        <input
                            id="harvest-date"
                            type="date"
                            required
                            value={date}
                            min={cycleStartDate}
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
                        />
                        {cycleStartDate && (
                            <p className="text-xs text-slate-400 mt-1">
                                La fecha debe estar entre el inicio del ciclo ({cycleStartDate}) y hoy.
                            </p>
                        )}
                    </div>

                    {/* ── Partial: total fish count ── */}
                    {harvestType === "partial" && (
                        <div>
                            <label
                                htmlFor="total-fish-count"
                                className="block text-sm font-semibold text-slate-700 mb-1"
                            >
                                Total de peces a cosechar <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="total-fish-count"
                                type="number"
                                min="1"
                                required
                                placeholder="Ej. 200"
                                value={totalFishCount}
                                onChange={(e) => setTotalFishCount(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            />
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-blue-400" />
                                Debe ser menor al stock disponible para que sea registrada como parcial.
                            </p>
                        </div>
                    )}

                    {/* ── Classifications ── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                <Scale className="w-4 h-4 text-slate-500" />
                                Clasificaciones comerciales{" "}
                                <span className="text-rose-500">*</span>
                                <span className="ml-1 text-xs font-normal text-slate-400">
                                    (mín. 1)
                                </span>
                            </label>
                            <button
                                type="button"
                                onClick={addClassification}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-3 py-1.5 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Agregar
                            </button>
                        </div>

                        <div className="space-y-3">
                            {classifications.map((cls, idx) => (
                                <ClassificationRow
                                    key={idx}
                                    cls={cls}
                                    index={idx}
                                    total={classifications.length}
                                    onChange={(field, value) =>
                                        updateClassification(idx, field, value)
                                    }
                                    onRemove={() => removeClassification(idx)}
                                />
                            ))}
                        </div>

                        {classifications.length > 1 && (
                            <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-500 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                                {classifications.length} clasificaciones agregadas.
                                Total peces:{" "}
                                <span className="font-semibold text-slate-700">
                                    {classifications.reduce(
                                        (acc, c) => acc + (Number(c.fish_count) || 0),
                                        0
                                    )}
                                </span>
                                {" · "}
                                Total peso:{" "}
                                <span className="font-semibold text-slate-700">
                                    {classifications
                                        .reduce(
                                            (acc, c) => acc + (Number(c.total_weight_g) || 0),
                                            0
                                        )
                                        .toLocaleString("es-GT")}{" "}
                                    g
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ── Observations ── */}
                    <div>
                        <label
                            htmlFor="harvest-observations"
                            className="block text-sm font-semibold text-slate-700 mb-1"
                        >
                            Observaciones{" "}
                            <span className="font-normal text-slate-400">(opcional)</span>
                        </label>
                        <textarea
                            id="harvest-observations"
                            rows={3}
                            placeholder="Observaciones sobre la cosecha, condiciones del día, calidad del producto..."
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-shadow"
                        />
                    </div>

                    {/* ── Footer ── */}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Registrando...
                                </>
                            ) : (
                                <>
                                    <Fish className="w-4 h-4" />
                                    Registrar Cosecha
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
