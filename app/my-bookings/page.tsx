"use client";

import { useState } from "react";
import { DateTime } from "luxon";
import { AIRPORTS as AIRPORT_INFO } from "@/lib/airports";

interface Booking {
  flightId: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureUTC: string;
  arrivalUTC: string;
  price: number;
  bookingRef: string;
}

export default function MyBookingsPage() {
  const [passengerId, setPassengerId] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleLookup() {
    setError("");
    if (passengerId === "") {
      setError("Please enter a passenger ID.");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/passenger-bookings?passengerId=${passengerId}`);
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(flightId: string, bookingRef: string) {
    if (!confirm(`Cancel booking ${bookingRef}?`)) return;
    try {
      const res = await fetch("/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightId, bookingRef }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to cancel booking.");
        return;
      }
      handleLookup();
    } catch {
      setError("Something went wrong while cancelling.");
    }
  }

  function formatDateTime(utc: string, airportCode: string) {
    const tz = AIRPORT_INFO[airportCode]?.timezone ?? "Pacific/Auckland";
    return DateTime.fromISO(utc, { zone: "utc" })
      .setZone(tz)
      .toFormat("dd LLL yyyy, h:mm a");
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      {/* Lookup form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
        <label className="block mb-4">
          <span className="block text-sm font-medium text-slate-600 mb-1">Passenger ID</span>
          <input
            type="number"
            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-400 focus:outline-none"
            value={passengerId}
            onChange={(e) => setPassengerId(e.target.value)}
            placeholder="e.g. 0"
          />
        </label>
        <button
          onClick={handleLookup}
          className="w-full bg-sky-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-sky-700 transition"
        >
          View My Bookings
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p className="text-slate-500">Loading...</p>}
      {!loading && searched && bookings.length === 0 && !error && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg">No bookings found for that passenger.</p>
        </div>
      )}

      {/* Booking list */}
      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b.bookingRef}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex justify-between items-center hover:shadow-md transition"
          >
            <div>
              <p className="font-bold text-lg">
                <span className="text-sky-600">{b.flightNumber}</span>
                {"  "}{b.origin} → {b.destination}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Departs {formatDateTime(b.departureUTC, b.origin)}
              </p>
              <p className="text-sm text-slate-400 mt-0.5">
                Booking ref: <span className="font-medium text-slate-600">{b.bookingRef}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl mb-2">${b.price}</p>
              <button
                onClick={() => handleCancel(b.flightId, b.bookingRef)}
                className="border border-red-500 text-red-600 rounded-lg px-4 py-1.5 text-sm font-semibold hover:bg-red-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 