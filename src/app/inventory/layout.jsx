import "../globals.css";
import { Navbar } from "../components/layout/navbar";

export const metadata = {
  title: "Inventario - Póngase Trucha",
  description: "Gestión de Inventario",
};

export default function InventoryLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
