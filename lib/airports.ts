// Airport info: ICAO code -> name and IANA timezone.
// Timezones matter because we convert local departure times to UTC.
export const AIRPORTS: Record<string, { name: string; timezone: string }> = {
  NZNE: { name: "Dairy Flat", timezone: "Pacific/Auckland" },
  YSSY: { name: "Sydney", timezone: "Australia/Sydney" },
  NZRO: { name: "Rotorua", timezone: "Pacific/Auckland" },
  NZGB: { name: "Claris (Great Barrier)", timezone: "Pacific/Auckland" },
  NZCI: { name: "Tuuta (Chatham)", timezone: "Pacific/Chatham" },
  NZTL: { name: "Lake Tekapo", timezone: "Pacific/Auckland" },
};