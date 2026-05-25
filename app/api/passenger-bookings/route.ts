import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const passengerId = request.nextUrl.searchParams.get("passengerId");

    if (passengerId === null || passengerId === "") {
      return NextResponse.json(
        { error: "Missing passengerId" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("dairyflat");

    // Find all flights that contain a booking for this passenger.
    const flights = await db
      .collection("schedules")
      .find({ "bookings.passengerId": Number(passengerId) })
      .sort({ departureUTC: 1 })
      .toArray();

    // For each flight, pull out this passenger's booking reference.
    const result = flights.map((flight) => {
      const booking = (flight.bookings ?? []).find(
        (b: { passengerId: number }) => b.passengerId === Number(passengerId)
      );
      return {
        flightId: flight._id,
        flightNumber: flight.flightNumber,
        origin: flight.origin,
        destination: flight.destination,
        departureUTC: flight.departureUTC,
        arrivalUTC: flight.arrivalUTC,
        price: flight.price,
        bookingRef: booking?.bookingRef ?? null,
      };
    });

    return NextResponse.json({ bookings: result });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch passenger bookings",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}