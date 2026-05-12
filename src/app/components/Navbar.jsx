"use client";

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Settings, UserRound, Fish, UserRoundPlus } from 'lucide-react';

export function Navbar() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: "Cargando...",
    role: "Usuario"
  });

  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        setUserData(JSON.parse(userString));
      }
    } catch {
      setUserData({ name: "Cargando...", role: "Usuario" });
    }
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault()
    setIsLoading(true);


    try {

      const token = localStorage.getItem("access")
      const refresh = localStorage.getItem("refresh");

      const res = await fetch("https://backend-pongase-trucha.onrender.com/api/auth/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          refresh: refresh,
        })
      })

      if (!res.ok) {
        setIsLoading(false);
        throw new Error("Error al cerrar sesion")
      }

      localStorage.clear();
      router.push('/');

    } catch (error) {
      console.error(error)
      setIsLoading(false)
    }
  };

  const handleSettings = () => {
    router.push('/manageUsers');
  };

  const handleHome = () => {
    router.push('/home');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-lg font-semibold">Cerrando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <button
            onClick={handleHome}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity hover:cursor-pointer"
          >

            <img src="/images/PongaseTrucha.png" alt="" className="w-12 h-12" />
            <span className="text-xl font-bold text-[#4F8FB3]">
              Póngase Trucha
            </span>
          </button>

          <div className="flex items-center gap-4">

            <div className="flex items-center gap-3 px-4 bg-slate-50 rounded-lg">
              <div className="bg-[#ffe4d2] p-2 rounded-full">
                <UserRound className="w-5 h-5 text-[#f4b183]" />
              </div>
              <div className="text-left">
                <p className="font-bold text-md text-slate-800">
                  {userData.name}
                </p>
                <p className="text-sm capitalize">
                  {userData.role?.name}
                </p>
              </div>
            </div>

            <button 
              title='Gestionar Trabajadores'
              onClick={handleSettings}
              className="flex items-center gap-2 px-4 py-2 text-[#6ec3b1] hover:bg-[#e3fff9] rounded-lg transition-colors hover:cursor-pointer"
            >
              <UserRoundPlus className="w-5 h-5" />
              <span className="text-md font-bold">Trabajadores</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors hover:cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-md font-bold">Salir</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}