"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { AlertCircleIcon } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Field, 
  FieldGroup, 
  FieldLabel 
} from "@/components/ui/field";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(false);
    setIsLoading(true);

    try {
      const res = await fetch(
        "https://backend-pongase-trucha.onrender.com/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password
          }),
        }
      );

      const data = await res.json();

      if(!res.ok){
        setIsLoading(false);
        setLoginError(true);
        return;
      }

      console.log("Respuesta:", data);

      localStorage.setItem("access", data.tokens.access);
      localStorage.setItem("refresh", data.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push('/home');
    } catch (error){
      console.error("Error en el login:", error);
      setLoginError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
      
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            <p className="mt-4 font-medium text-slate-700">Iniciando sesión...</p>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        
        <div className="flex justify-center mb-3">
            <img src="./images/PongaseTrucha.png" alt="Logo" className="w-30 h-30"/>  
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">Póngase Trucha</h1>
        <p className="text-center text-slate-600 mb-4">Gestión de Acuicultura</p>
        
        {loginError && (
          <Alert variant="destructive" className="max-w-md mb-4">
            <AlertCircleIcon />
            <AlertTitle>Inicio de sesion fallido :(</AlertTitle>
            <AlertDescription>
              No se pudo iniciar sesio. Revisa tus credenciales.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FieldGroup className="space-y-5">
            <Field>
              <FieldLabel htmlFor="email" className="text-xl">Correo Electrónico</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-2 w-5 h-5 text-slate-400 z-10" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="off"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 text-black border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="password"  className="text-xl">Contraseña</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-2 w-5 h-5 text-slate-400 z-10" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="off"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="pl-10 text-black border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </Field>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg font-medium transition-all"
            >
              Iniciar Sesión
            </Button>

          </FieldGroup>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            Para más información contáctenos<br />
            <span className="font-medium text-slate-600">andresfelipemope@ufps.edu.co</span><br />
            <span className="font-medium text-slate-600">keylersneiderac@ufps.edu.co</span>
          </p>
        </div>
      </div>
    </div>
  );
}