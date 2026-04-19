"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { RegisterWorker } from "../components/RegisterWorker";
import { RegisterManager } from "../components/RegisterManager";

import { Toaster } from "sonner";

export default function ManageUsersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster richColors position="top-right" />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a la Página de Inicio
        </button>

        <RegisterManager />
        <RegisterWorker />
      </div>
    </div>
  );
}