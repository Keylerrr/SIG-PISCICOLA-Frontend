"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react"
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

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [recoverEmail, setRecoverEmail] = useState('');
  const [openRecovery, setOpenRecovery] = useState(false);
  const [recoverSuccess, setRecoverSuccess] = useState(false);
  const [errorRecovery, setErrorRecovery] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleRecover = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const res = await fetch("https://backend-pongase-trucha.onrender.com/auth/reset-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: recoverEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Error:", data);
        setIsSending(false);
        setErrorRecovery(true);
        return;
      }
      setRecoverSuccess(true);
      setOpenRecovery(false);
      setIsSending(false);
      console.log("Correo enviado:");
    } catch (error) {
      console.error("Error en recuperación:", error);
    }
  };

  /*const handleSubmit = async (e) => {
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

      if (!res.ok) {
        setIsLoading(false);
        setLoginError(true);
        return;
      }

      console.log("Respuesta:", data);

      localStorage.setItem("access", data.tokens.access);
      localStorage.setItem("refresh", data.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push('/home');
    } catch (error) {
      console.error("Error en el login:", error);
      setLoginError(true);
      setIsLoading(false);
    }
  };*/

  //HANDLE SUBMIT FALSO NO BACKEND
  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem("access", "fake");
    localStorage.setItem("refresh", "fake");
    localStorage.setItem("user", JSON.stringify({
      email: "demo@demo.com"
    }));

    router.push("/home");
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

      {isSending && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            <p className="mt-4 font-medium text-slate-700">
              Enviando correo con instrucciones...
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <div className="flex justify-center mb-3">
          <img src="./images/PongaseTrucha.png" alt="Logo" className="w-30 h-30" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">Póngase Trucha</h1>
        <p className="text-center text-slate-600 mb-4">Gestión de Acuicultura</p>

        {loginError && (
          <Alert variant="destructive" className="max-w-md mb-4">
            <AlertCircleIcon />
            <AlertTitle>Inicio de sesion fallido :(</AlertTitle>
            <AlertDescription>
              No se pudo iniciar sesion. Revisa tus credenciales.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {recoverSuccess && (
            <Alert className="mb-4">
              <CheckCircle2Icon />
              <AlertTitle>Correo enviado</AlertTitle>
              <AlertDescription>
                Revisa tu bandeja de entrada para recuperar tu contraseña.
              </AlertDescription>
            </Alert>
          )}

          {errorRecovery && (
            <Alert className="mb-4">
              <AlertCircleIcon />
              <AlertTitle>No se pudo enviar el correo</AlertTitle>
              <AlertDescription>
                Ocurrio un error, vuelve a intentarlo
              </AlertDescription>
            </Alert>
          )}
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
              <FieldLabel htmlFor="password" className="text-xl">Contraseña</FieldLabel>
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

        <div className="w-full mt-6 pt-6 border-t border-slate-200 flex justify-center flex-col items-center gap-4">
          <div className="text-sm text-slate-600">
            ¿Olvidaste tu contraseña?
          </div>
          <Dialog open={openRecovery} onOpenChange={setOpenRecovery}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setOpenRecovery(true)}>
                Recuperar Contraseña
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-sm">

              <form onSubmit={handleRecover}>
                <DialogHeader className="my-3">
                  <DialogTitle>Recuperar contraseña</DialogTitle>
                  <DialogDescription>
                    Digite su correo electronico
                  </DialogDescription>
                </DialogHeader>

                <FieldGroup className="mb-6">
                  <Field>
                    <Input
                      id="correo"
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      required
                      value={recoverEmail}
                      onChange={(e) => setRecoverEmail(e.target.value)}
                    />
                  </Field>
                </FieldGroup>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </DialogClose>

                  <Button type="submit">
                    Enviar
                  </Button>
                </DialogFooter>

              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}