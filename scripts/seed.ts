import { MongoClient } from "mongodb";
import { DateTime } from "luxon";
import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import path from "path";
import { ROUTE_RULES } from "../lib/routes";
import { AIRPORTS } from "../lib/airports";

// Read the connection string from .env.local manually,
// because this script runs outside Next.js.
import { config } from "dotenv";
config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set in .env.local");
}

// How many weeks of flights to generate.
const WEEKS_TO_GENERATE = 8;

// ---- Passenger type ----
interface Passenger {
  passengerId: number;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
}

// ---- Flight (schedule) type ----
interface Flight {
  flightNumber: string;
  origin: string;
  destination: string;
  capacity: number;
  price: number;
  departureUTC: Date;
  arrivalUTC: Date;
  bookings: unknown[];
}

// Load passengers from the CSV file.
function loadPassengers(): Passenger[] {
  const csvPath = path.join("data", "randomnames.csv");
  const fileContent = readFileSync(csvPath, "utf-8");

  // CSV has no header row: id, title, firstName, lastName, gender, email
  const records: string[][] = parse(fileContent, {
    skip_empty_lines: true,
  });

  return records.map((row) => ({
    passengerId: Number(row[0]),
    title: row[1],
    firstName: row[2],
    lastName: row[3],
    // row[4] is gender, which we intentionally drop
    email: row[5],
  }));
}

// Generate flight documents for the next N weeks, with real calendar dates.
function generateFlights(): Flight[] {
  const flights: Flight[] = [];

  // Start from next Monday (in NZ time) for a clean starting point.
  const startDate = DateTime.now()
    .setZone("Pacific/Auckland")
    .startOf("week"); // luxon week starts on Monday

  const totalDays = WEEKS_TO_GENERATE * 7;

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const currentDay = startDate.plus({ days: dayOffset });
    const weekday = currentDay.weekday; // 1 = Monday ... 7 = Sunday

    for (const rule of ROUTE_RULES) {
      if (!rule.daysOfWeek.includes(weekday)) {
        continue; // this flight does not operate on this weekday
      }

      const originTz = AIRPORTS[rule.origin].timezone;
      const [hour, minute] = rule.departTime.split(":").map(Number);

      // Build the local departure time at the origin airport,
      // then convert to UTC for storage.
      const departureLocal = currentDay.setZone(originTz, {
        keepLocalTime: true,
      }).set({ hour, minute, second: 0, millisecond: 0 });

      const departureUTC = departureLocal.toUTC();
      const arrivalUTC = departureUTC.plus({ minutes: rule.durationMinutes });

      flights.push({
        flightNumber: rule.flightNumber,
        origin: rule.origin,
        destination: rule.destination,
        capacity: rule.capacity,
        price: rule.price,
        departureUTC: departureUTC.toJSDate(),
        arrivalUTC: arrivalUTC.toJSDate(),
        bookings: [],
      });
    }
  }

  return flights;
}

// Main: connect, clear old data, insert fresh data.
async function main() {
  const client = new MongoClient(uri!);
  await client.connect();
  console.log("Connected to MongoDB.");

  const db = client.db("dairyflat");

  const passengers = loadPassengers();
  const flights = generateFlights();

  // Clear existing data so the script can be run repeatedly.
  await db.collection("passengers").deleteMany({});
  await db.collection("schedules").deleteMany({});
  console.log("Cleared old data.");

  await db.collection("passengers").insertMany(passengers);
  console.log(`Inserted ${passengers.length} passengers.`);

  await db.collection("schedules").insertMany(flights);
  console.log(`Inserted ${flights.length} flights.`);

  await client.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});