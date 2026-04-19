"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Settings, User, Fish, UserRoundCog } from 'lucide-react';

export function Navbar() {
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

    try {

      const token = localStorage.getItem("access")

      const res = await fetch("https://backend-pongase-trucha.onrender.com/auth/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error("Error al cerrar sesion")

      //console.log(res)

      localStorage.clear();
      router.push('/');

    } catch (error) {
      console.error(error)
    }
  };

  const handleSettings = () => {
    router.push('/manageUsers');
  };

  const handleHome = () => {
    router.push('/home');
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <button
            onClick={handleHome}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >

            <img src="/images/PongaseTrucha.png" alt="" className="w-12 h-12" />
            <span className="text-xl font-bold text-slate-800">
              Póngase Trucha
            </span>
          </button>

          <div className="flex items-center gap-4">

            <div className="flex items-center gap-3 px-4 bg-slate-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-md text-slate-800">
                  {userData.name}
                </p>
                <p className="font-bold text-md capitalize">
                  {userData.role}
                </p>
              </div>
            </div>

            <button
              onClick={handleSettings}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <UserRoundCog className="w-5 h-5" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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