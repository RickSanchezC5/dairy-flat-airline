"use client";

import { useState } from "react";
import { DateTime } from "luxon";
import { AIRPORTS as AIRPORT_INFO } from "@/lib/airports";

const AIRPORTS = [
  { code: "NZNE", name: "Dairy Flat" },
  { code: "YSSY", name: "Sydney" },
  { code: "NZRO", name: "Rotorua" },
  { code: "NZGB", name: "Claris (Great Barrier)" },
  { code: "NZCI", name: "Tuuta (Chatham)" },
  { code: "NZTL", name: "Lake Tekapo" },
];

// Default the date range to today .. 30 days from now (YYYY-MM-DD).
const today = DateTime.now().setZone("Pacific/Auckland");
const DEFAULT_DATE1 = today.toFormat("yyyy-MM-dd");
const DEFAULT_DATE2 = today.plus({ days: 30 }).toFormat("yyyy-MM-dd");

interface Flight {
  _id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureUTC: string;
  arrivalUTC: string;
  price: number;
  capacity: number;
  seatsLeft: number;
}

interface Invoice {
  bookingRef: string;
  flight: {
    flightNumber: string;
    origin: string;
    destination: string;
    departureUTC: string;
    arrivalUTC: string;
    price: number;
  };
  passenger: {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function SearchPage() {
  const [orig, setOrig] = useState("NZNE");
  const [dest, setDest] = useState("NZRO");
  const [date1, setDate1] = useState(DEFAULT_DATE1);
  const [date2, setDate2] = useState(DEFAULT_DATE2);

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const [bookingFlight, setBookingFlight] = useState<Flight | null>(null);
  const [passengerId, setPassengerId] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  async function handleSearch() {
    setError("");
    if (!date1 || !date2) {
      setError("Please choose both a start date and an end date.");
      return;
    }
    if (orig === dest) {
      setError("Origin and destination must be different.");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const url = `/api/schedules?orig=${orig}&dest=${dest}&date1=${date1}&date2=${date2}`;
      const res = await fetch(url);
      const data = await res.json();
      setFlights(data.flights ?? []);
    } catch {
      setError("Something went wrong while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBook() {
    setBookingError("");
    if (passengerId === "") {
      setBookingError("Please enter a passenger ID.");
      return;
    }
    if (!bookingFlight) return;
    setBookingLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightId: bookingFlight._id,
          passengerId: Number(passengerId),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBookingError(data.error ?? "Booking failed.");
        return;
      }
      setInvoice(data);
      setBookingFlight(null);
      setPassengerId("");
      handleSearch();
    } catch {
      setBookingError("Something went wrong. Please try again.");
    } finally {
      setBookingLoading(false);
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
      <h1 className="text-3xl font-bold mb-6">Search Flights</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label>
            <span className="block text-sm font-medium text-slate-600 mb-1">From</span>
            <select className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-400 focus:outline-none"
              value={orig} onChange={(e) => setOrig(e.target.value)}>
              {AIRPORTS.map((a) => (
                <option key={a.code} value={a.code}>{a.name} ({a.code})</option>
              ))}
            </select>
          </label>
          <label>
            <span className="block text-sm font-medium text-slate-600 mb-1">To</span>
            <select className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-400 focus:outline-none"
              value={dest} onChange={(e) => setDest(e.target.value)}>
              {AIRPORTS.map((a) => (
                <option key={a.code} value={a.code}>{a.name} ({a.code})</option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label>
            <span className="block text-sm font-medium text-slate-600 mb-1">Earliest date</span>
            <input type="date" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-400 focus:outline-none"
              value={date1} onChange={(e) => setDate1(e.target.value)} />
          </label>
          <label>
            <span className="block text-sm font-medium text-slate-600 mb-1">Latest date</span>
            <input type="date" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-400 focus:outline-none"
              value={date2} onChange={(e) => setDate2(e.target.value)} />
          </label>
        </div>
        <button onClick={handleSearch}
          className="w-full bg-sky-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-sky-700 transition">
          Search Flights
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p className="text-slate-500">Searching...</p>}
      {!loading && searched && flights.length === 0 && !error && (
        <p className="text-slate-500">No flights found for that route and date range.</p>
      )}

      <div className="space-y-4">
        {flights.map((flight) => (
          <div key={flight._id}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex justify-between items-center hover:shadow-md transition">
            <div>
              <p className="font-bold text-lg">
                <span className="text-sky-600">{flight.flightNumber}</span>
                {"  "}{flight.origin} → {flight.destination}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Departs {formatDateTime(flight.departureUTC, flight.origin)}
              </p>
              <p className="text-sm text-slate-500">
                Arrives {formatDateTime(flight.arrivalUTC, flight.destination)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl">${flight.price}</p>
              <p className={`text-sm mb-2 ${flight.seatsLeft <= 1 ? "text-amber-600" : "text-slate-500"}`}>
                {flight.seatsLeft} seats left
              </p>
              <button disabled={flight.seatsLeft <= 0}
                onClick={() => { setBookingFlight(flight); setBookingError(""); }}
                className="bg-sky-600 text-white rounded-lg px-4 py-1.5 text-sm font-semibold hover:bg-sky-700 disabled:bg-slate-300 transition">
                {flight.seatsLeft <= 0 ? "Full" : "Book"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {bookingFlight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-2">Book Flight</h2>
            <p className="mb-1">
              <span className="text-sky-600 font-semibold">{bookingFlight.flightNumber}</span>{"  "}
              {bookingFlight.origin} → {bookingFlight.destination}
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Departs {formatDateTime(bookingFlight.departureUTC, bookingFlight.origin)}
            </p>
            <label className="block mb-4">
              <span className="block text-sm font-medium text-slate-600 mb-1">Passenger ID</span>
              <input type="number" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                value={passengerId} onChange={(e) => setPassengerId(e.target.value)} placeholder="e.g. 0" />
            </label>
            {bookingError && <p className="text-red-600 mb-3 text-sm">{bookingError}</p>}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setBookingFlight(null)}
                className="border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleBook} disabled={bookingLoading}
                className="bg-sky-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-sky-700 disabled:bg-slate-300 transition">
                {bookingLoading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {invoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">✓</span>
              <h2 className="text-xl font-bold text-emerald-600">Booking Confirmed</h2>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Booking ref</span><span className="font-semibold">{invoice.bookingRef}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Flight</span><span className="font-semibold">{invoice.flight.flightNumber} ({invoice.flight.origin} → {invoice.flight.destination})</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Departs</span><span>{formatDateTime(invoice.flight.departureUTC, invoice.flight.origin)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Arrives</span><span>{formatDateTime(invoice.flight.arrivalUTC, invoice.flight.destination)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Passenger</span><span>{invoice.passenger.title} {invoice.passenger.firstName} {invoice.passenger.lastName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Email</span><span>{invoice.passenger.email}</span></div>
              <div className="flex justify-between pt-2 border-t border-slate-200 mt-2"><span className="font-semibold">Total</span><span className="font-bold text-lg">${invoice.flight.price}</span></div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setInvoice(null)}
                className="bg-sky-600 text-white rounded-lg px-5 py-2 font-semibold hover:bg-sky-700 transition">Done</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}  