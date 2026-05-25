import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Generate a short, unique-ish booking reference, e.g. "A1B2C3".
function generateBookingRef(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let ref = "";
    for (let i = 0; i < 6; i++) {
        ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ref;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { flightId, passengerId } = body;

        // Validate input.
        if (!flightId || passengerId === undefined || passengerId === null) {
            return NextResponse.json(
                { error: "Missing flightId or passengerId" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("dairyflat");

        // Look up the flight.
        const flight = await db
            .collection("schedules")
            .findOne({ _id: new ObjectId(String(flightId)) });

        if (!flight) {
            return NextResponse.json({ error: "Flight not found" }, { status: 404 });
        }

        // Check if the flight is already full.
        const currentBookings = flight.bookings?.length ?? 0;
        if (currentBookings >= flight.capacity) {
            return NextResponse.json(
                { error: "This flight is fully booked" },
                { status: 409 }
            );
        }

        // Check the passenger exists.
        const passenger = await db
            .collection("passengers")
            .findOne({ passengerId: Number(passengerId) });

        if (!passenger) {
            return NextResponse.json(
                { error: "Passenger not found" },
                { status: 404 }
            );
        }

        // Prevent the same passenger from booking the same flight twice.
        const alreadyBooked = (flight.bookings ?? []).some(
            (b: { passengerId: number }) => b.passengerId === Number(passengerId)
        );
        if (alreadyBooked) {
            return NextResponse.json(
                { error: "Passenger is already booked on this flight" },
                { status: 409 }
            );
        }

        // Create the booking and add it to the flight's bookings array.
        const bookingRef = generateBookingRef();
        const newBooking = { bookingRef, passengerId: Number(passengerId) };
        await db.collection("schedules").updateOne(
            { _id: new ObjectId(String(flightId)) },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { $push: { bookings: newBooking } } as any
        );

        // Return details so the front end can show an invoice page.
        return NextResponse.json({
            ok: true,
            bookingRef,
            flight: {
                flightNumber: flight.flightNumber,
                origin: flight.origin,
                destination: flight.destination,
                departureUTC: flight.departureUTC,
                arrivalUTC: flight.arrivalUTC,
                price: flight.price,
            },
            passenger: {
                passengerId: passenger.passengerId,
                title: passenger.title,
                firstName: passenger.firstName,
                lastName: passenger.lastName,
                email: passenger.email,
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to create booking",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightId, bookingRef } = body;

    if (!flightId || !bookingRef) {
      return NextResponse.json(
        { error: "Missing flightId or bookingRef" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("dairyflat");

    // Remove the booking with the matching bookingRef from the flight.
    const result = await db.collection("schedules").updateOne(
      { _id: new ObjectId(String(flightId)) },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { $pull: { bookings: { bookingRef } } } as any
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: "Booking cancelled" });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to cancel booking",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}