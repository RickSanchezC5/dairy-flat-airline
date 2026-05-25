// One entry per scheduled flight in the weekly timetable.
// dayOfWeek: 1 = Monday ... 7 = Sunday (matching luxon's weekday numbering)
// departTime: local time at the origin airport, "HH:mm"
// durationMinutes: flight duration in minutes
export interface RouteRule {
  flightNumber: string;
  origin: string;
  destination: string;
  capacity: number;
  price: number;
  daysOfWeek: number[];   // which weekdays this flight operates
  departTime: string;     // local departure time at origin
  durationMinutes: number;
}

export const ROUTE_RULES: RouteRule[] = [
  // Sydney prestige service (SyberJet, 6 seats)
  { flightNumber: "DF101", origin: "NZNE", destination: "YSSY", capacity: 6, price: 1200, daysOfWeek: [5], departTime: "10:00", durationMinutes: 210 },
  { flightNumber: "DF102", origin: "YSSY", destination: "NZNE", capacity: 6, price: 1200, daysOfWeek: [7], departTime: "15:00", durationMinutes: 180 },

  // Rotorua shuttle (Cirrus, 4 seats), two flights every weekday
  { flightNumber: "DF201", origin: "NZNE", destination: "NZRO", capacity: 4, price: 250, daysOfWeek: [1, 2, 3, 4, 5], departTime: "07:00", durationMinutes: 40 },
  { flightNumber: "DF202", origin: "NZRO", destination: "NZNE", capacity: 4, price: 250, daysOfWeek: [1, 2, 3, 4, 5], departTime: "08:30", durationMinutes: 40 },
  { flightNumber: "DF203", origin: "NZNE", destination: "NZRO", capacity: 4, price: 250, daysOfWeek: [1, 2, 3, 4, 5], departTime: "17:00", durationMinutes: 40 },
  { flightNumber: "DF204", origin: "NZRO", destination: "NZNE", capacity: 4, price: 250, daysOfWeek: [1, 2, 3, 4, 5], departTime: "18:30", durationMinutes: 40 },

  // Claris / Great Barrier (Cirrus, 4 seats)
  { flightNumber: "DF301", origin: "NZNE", destination: "NZGB", capacity: 4, price: 200, daysOfWeek: [1, 3, 5], departTime: "09:00", durationMinutes: 30 },
  { flightNumber: "DF302", origin: "NZGB", destination: "NZNE", capacity: 4, price: 200, daysOfWeek: [2, 4, 6], departTime: "09:00", durationMinutes: 30 },

  // Tuuta / Chatham (HondaJet, 5 seats)
  { flightNumber: "DF401", origin: "NZNE", destination: "NZCI", capacity: 5, price: 450, daysOfWeek: [2, 5], departTime: "11:00", durationMinutes: 100 },
  { flightNumber: "DF402", origin: "NZCI", destination: "NZNE", capacity: 5, price: 450, daysOfWeek: [3, 6], departTime: "11:00", durationMinutes: 115 },

  // Lake Tekapo (HondaJet, 5 seats)
  { flightNumber: "DF501", origin: "NZNE", destination: "NZTL", capacity: 5, price: 400, daysOfWeek: [1], departTime: "13:00", durationMinutes: 90 },
  { flightNumber: "DF502", origin: "NZTL", destination: "NZNE", capacity: 5, price: 400, daysOfWeek: [2], departTime: "13:00", durationMinutes: 90 },
];