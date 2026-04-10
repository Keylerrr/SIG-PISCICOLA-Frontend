"use client";

import { Login } from "./components/Login";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    const token = localStorage.getItem("access");

    if (token) {
      router.push("/home");
    }
  }, []);

  return <Login />;
}