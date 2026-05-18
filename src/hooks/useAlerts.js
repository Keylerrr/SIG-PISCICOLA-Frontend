import { useState, useEffect } from "react";

const API_BASE = "https://backend-pongase-trucha.onrender.com/api";

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      // First fetch farms to get farm IDs
      const farmsRes = await fetch(`${API_BASE}/farms/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!farmsRes.ok) return;
      const farms = await farmsRes.json();
      
      if (!Array.isArray(farms)) return;

      // Then fetch alerts for each farm
      let allAlerts = [];
      for (const farm of farms) {
        const alertsRes = await fetch(`${API_BASE}/farms/core/${farm.id}/alerts/?is_resolved=false`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (alertsRes.ok) {
          const farmAlerts = await alertsRes.json();
          if (Array.isArray(farmAlerts)) {
            // Attach farmId to each alert so we can resolve it later
            allAlerts = [...allAlerts, ...farmAlerts.map(a => ({ ...a, farmId: farm.id }))];
          }
        }
      }

      // Sort by date descending
      allAlerts.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));

      setAlerts(allAlerts);
      setUnreadCount(allAlerts.length);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;
      
      const resolvePromises = alerts.map(alert => {
        if (!alert.farmId) return Promise.resolve();
        return fetch(`${API_BASE}/farms/core/${alert.farmId}/alerts/${alert.id}/resolve/`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({})
        });
      });

      await Promise.all(resolvePromises);
      await fetchAlerts();
    } catch (error) {
       console.error("Error marking all as read:", error);
    }
  };

  const markAsRead = async (alertId, farmId) => {
    try {
      const token = localStorage.getItem("access");
      if (!token || !farmId) return;
      
      await fetch(`${API_BASE}/farms/core/${farmId}/alerts/${alertId}/resolve/`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({})
      });
      await fetchAlerts();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAlerts();
    }, 0);
    const interval = setInterval(fetchAlerts, 60000); // refresh every minute
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return { alerts, unreadCount, fetchAlerts, markAllAsRead, markAsRead };
}
