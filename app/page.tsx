"use client";

import { useEffect, useState } from "react";
import { supabase } from '../supabase';

const STATUS_COLORS: Record<Order["status"], string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  accepted: "bg-blue-100 text-blue-700 border-blue-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
};

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "⏳ Pending",
  accepted: "🚚 Accepted",
  delivered: "✅ Delivered",
};

export default function VendorPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Fetch all orders on mount
  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  }

  // Update order status
  async function updateStatus(id: number, status: Order["status"]) {
    setUpdatingId(id);
    await supabase.from("orders").update({ status }).eq("id", id);
    setUpdatingId(null);
    // Realtime will update the list automatically
  }

  useEffect(() => {
    fetchOrders();

    // Realtime subscription — listens for any INSERT or UPDATE
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new as Order, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === (payload.new as Order).id ? (payload.new as Order) : o
              )
            );
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) =>
              prev.filter((o) => o.id !== (payload.old as Order).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const pending = orders.filter((o) => o.status === "pending");
  const accepted = orders.filter((o) => o.status === "accepted");
  const delivered = orders.filter((o) => o.status === "delivered");

  return (
    <main className="relative z-10 min-h-screen px-4 py-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-water-700 flex items-center justify-center shadow">
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2C12 2 5 9.5 5 14a7 7 0 0014 0c0-4.5-7-12-7-12z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-water-900">
            JalSetu — Vendor
          </h1>
          <p className="text-sm text-water-500 font-medium">
            Live orders dashboard
            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </p>
        </div>
        <a
          href="/"
          className="ml-auto text-sm text-water-500 hover:text-water-700 font-medium underline underline-offset-2"
        >
          ← Customer
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Pending", count: pending.length, color: "text-amber-600" },
          { label: "Accepted", count: accepted.length, color: "text-blue-600" },
          { label: "Delivered", count: delivered.length, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-water-100 shadow-sm px-4 py-3 text-center">
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.count}</div>
            <div className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="text-center py-16 text-water-400 font-medium">
          Loading orders…
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-water-300 font-medium">
          No orders yet. Waiting for customers…
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              updating={updatingId === order.id}
              onAccept={() => updateStatus(order.id, "accepted")}
              onDeliver={() => updateStatus(order.id, "delivered")}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function OrderCard({
  order,
  updating,
  onAccept,
  onDeliver,
}: {
  order: Order;
  updating: boolean;
  onAccept: () => void;
  onDeliver: () => void;
}) {
  const date = new Date(order.created_at).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-2xl border border-water-100 shadow-sm p-5 flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-water-900 text-base">{order.name}</p>
          <p className="text-sm text-gray-500">{order.phone}</p>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full border ${
            STATUS_COLORS[order.status]
          }`}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Details */}
      <div className="text-sm text-gray-600 space-y-1">
        <div className="flex gap-2">
          <span className="text-water-400">📍</span>
          <span>{order.address}</span>
        </div>
        <div className="flex gap-4">
          <span>
            <span className="text-water-400">💧</span> {order.quantity}
          </span>
          <span>
            <span className="text-water-400">🏢</span> Floor: {order.floor}
          </span>
          <span className="ml-auto text-xs text-gray-400">{date}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        {order.status === "pending" && (
          <button
            onClick={onAccept}
            disabled={updating}
            className="flex-1 bg-water-600 hover:bg-water-700 text-white text-sm font-semibold py-2 rounded-xl transition disabled:opacity-50"
          >
            {updating ? "…" : "✅ Accept"}
          </button>
        )}
        {order.status === "accepted" && (
          <button
            onClick={onDeliver}
            disabled={updating}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-xl transition disabled:opacity-50"
          >
            {updating ? "…" : "📦 Mark Delivered"}
          </button>
        )}
        {order.status === "delivered" && (
          <div className="flex-1 text-center text-sm text-green-600 font-semibold py-2">
            Order completed 🎉
          </div>
        )}
      </div>
    </div>
  );
}
