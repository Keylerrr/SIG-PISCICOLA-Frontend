"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Package, Truck, ShoppingCart, ArrowRightLeft, Bell } from "lucide-react";
import { ProductsTab } from "../components/inventory/ProductsTab";
import { SuppliersTab } from "../components/inventory/SuppliersTab";
import { BuysTab } from "../components/inventory/BuysTab";
import { MovementsTab } from "../components/inventory/MovementsTab";
import { AlertsTab } from "../components/inventory/AlertsTab";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "sonner";

export default function InventoryContent() {
  const [farms, setFarms] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const farmIdFromUrl = searchParams.get("farmId");
  const [selectedFarm, setSelectedFarm] = useState(farmIdFromUrl || "");

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await fetch("https://backend-pongase-trucha.onrender.com/api/farms/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFarms(Array.isArray(data) ? data : []);
          if (Array.isArray(data) && data.length > 0) {
            if (farmIdFromUrl) {
              const exists = data.some(
                f => f.id.toString() === farmIdFromUrl
              );

              if (exists) {
                setSelectedFarm(farmIdFromUrl);
              } else {
                setSelectedFarm(data[0].id.toString());
              }
            } else {
              setSelectedFarm(data[0].id.toString());
            }
          }
        }
      } catch (err) {
        console.error("Error fetching farms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  const tabs = [
    { id: "products", name: "Productos", icon: Package },
    { id: "suppliers", name: "Proveedores", icon: Truck },
    { id: "buys", name: "Compras", icon: ShoppingCart },
    { id: "movements", name: "Movimientos", icon: ArrowRightLeft },
    { id: "alerts", name: "Alertas", icon: Bell },
  ];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Inventario</h1>
            <p className="text-slate-600">Gestiona los productos, proveedores y movimientos</p>
          </div>
          
          <div className="w-full md:w-72">
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Seleccionar Granja</label>
            <Select value={selectedFarm} onValueChange={setSelectedFarm}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Elige una granja..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {farms.map(f => (
                    <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedFarm ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                      isActive 
                        ? "text-blue-600 border-b-2 border-blue-600 bg-white" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </div>

            <div className="p-6 overflow-x-auto">
              {activeTab === "products" && <ProductsTab farmId={selectedFarm} />}
              {activeTab === "suppliers" && <SuppliersTab farmId={selectedFarm} />}
              {activeTab === "buys" && <BuysTab farmId={selectedFarm} />}
              {activeTab === "movements" && <MovementsTab farmId={selectedFarm} />}
              {activeTab === "alerts" && <AlertsTab farmId={selectedFarm} />}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Por favor selecciona o crea una granja para ver el inventario.</p>
          </div>
        )}
      </div>
    </div>
  );
}