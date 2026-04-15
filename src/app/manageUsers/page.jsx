"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  Pencil,
  Shield,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

export default function MaganeUsers() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al Dashboard</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            <button
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Nuevo Usuario
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <div>
              <p className="font-bold">{}</p>
              <p>Total</p>
            </div>
            <div>
              <p className="font-bold">{}</p>
              <p>Admins</p>
            </div>
            <div>
              <p className="font-bold">{}</p>
              <p>Operarios</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}