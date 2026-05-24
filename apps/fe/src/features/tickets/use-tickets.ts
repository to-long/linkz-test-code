import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import type { Ticket, Tab } from "./types";

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  useEffect(() => {
    async function fetchTickets() {
      try {
        const data = await api.getMyTickets();
        setTickets(data.tickets);
      } catch {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  const filteredTickets =
    activeTab === "all"
      ? tickets
      : tickets.filter((t) => t.status === activeTab);

  return { tickets, loading, activeTab, setActiveTab, filteredTickets };
}
