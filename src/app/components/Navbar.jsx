"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Settings, User, Fish, UserRoundPlus } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const [userData, setUserData] = useState(() => {
    try {
      const userString = localStorage.getItem("user");
      return userString
        ? JSON.parse(userString)
        : { name: "Cargando...", rol: "Usuario" };
    } catch {
      return { name: "Cargando...", rol: "Usuario" };
    }
  });

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const handleSettings = () => {
    router.push('/register');
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

            <img src="./images/PongaseTrucha.png" alt="" className="w-12 h-12" />
            <span className="text-xl font-bold text-slate-800">
              Póngase Trucha
            </span>
          </button>

          <div className="flex items-center gap-4">

            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-800">
                  {userData.name}
                </p>
                <p className="text-xs text-slate-500">
                  {userData.rol}
                </p>
              </div>
            </div>

            <button
              onClick={handleSettings}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <UserRoundPlus className="w-5 h-5" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Salir</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}