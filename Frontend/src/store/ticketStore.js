// src/store/ticketStore.js
import { create } from "zustand";
import api from "../api/api";

const useTicketStore = create((set, get) => ({
  tickets: [],
  loading: false,
  error: null,
  transferStatus: {}, // ticketId -> "loading" | "success" | "error"
  transferMessage: {}, // ticketId -> message string

  fetchMyTickets: async (userId) => {
    if (!userId) return;
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/my_tickets/${userId}`);
      set({ tickets: response.data, loading: false });
    } catch (error) {
      set({ error: "Could not load your tickets", loading: false });
    }
  },

  transferTicket: async (ticketId, recipientEmail, userId) => {
    set((state) => ({
      transferStatus: { ...state.transferStatus, [ticketId]: "loading" },
      transferMessage: { ...state.transferMessage, [ticketId]: "" },
    }));
    try {
      const response = await api.post(`/tickets/${ticketId}/transfer`, {
        recipient_email: recipientEmail,
      });
      set((state) => ({
        transferStatus: { ...state.transferStatus, [ticketId]: "success" },
        transferMessage: {
          ...state.transferMessage,
          [ticketId]: response.data.message || "Ticket transferred!",
        },
      }));
      // Refresh so the transferred ticket disappears from this user's list.
      if (userId) {
        await get().fetchMyTickets(userId);
      }
    } catch (error) {
      const message =
        error.response?.data?.detail || "Transfer failed. Please try again.";
      set((state) => ({
        transferStatus: { ...state.transferStatus, [ticketId]: "error" },
        transferMessage: { ...state.transferMessage, [ticketId]: message },
      }));
    }
  },
}));

export default useTicketStore;
