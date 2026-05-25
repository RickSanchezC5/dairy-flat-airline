import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const orig = searchParams.get("orig");
    const dest = searchParams.get("dest");
    const date1 = searchParams.get("date1"); // start date, e.g. 2026-06-10
    const date2 = searchParams.get("date2"); // end date,   e.g. 2026-06-30

    // Validate required parameters.
    if (!orig || !dest || !date1 || !date2) {
      return NextResponse.json(
        { error: "Missing required parameters: orig, dest, date1, date2" },
        { status: 400 }
      );
    }

    // Build the date range. date1 starts at 00:00, date2 ends at 23:59:59.
    const startDate = new Date(`${date1}T00:00:00.000Z`);
    const endDate = new Date(`${date2}T23:59:59.999Z`);

    const client = await clientPromise;
    const db = client.db("dairyflat");

    // Find flights matching origin, destination, and departure date range.
    const flights = await db
      .collection("schedules")
      .find({
        origin: orig,
        destination: dest,
        departureUTC: { $gte: startDate, $lte: endDate },
      })
      .sort({ departureUTC: 1 }) // earliest first
      .toArray();

    // Add a "seatsLeft" field to each flight for convenience.
    const result = flights.map((flight) => ({
      ...flight,
      seatsLeft: flight.capacity - (flight.bookings?.length ?? 0),
    }));

    return NextResponse.json({ flights: result });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to search flights",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}