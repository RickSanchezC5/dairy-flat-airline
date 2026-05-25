import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      {/* Hero section with a sky-blue gradient background */}
      <section className="bg-gradient-to-b from-sky-500 to-sky-700 text-white">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <p className="uppercase tracking-widest text-sky-100 text-sm mb-3">
            Dairy Flat Airport · NZNE
          </p>
          <h1 className="text-5xl font-bold mb-4">Fly above the ordinary</h1>
          <p className="text-xl text-sky-100 mb-2">
            Premium point-to-point light jet flights
          </p>
          <p className="text-sky-200 mb-10">
            Sydney · Rotorua · Great Barrier · Chatham Islands · Lake Tekapo
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/search"
              className="bg-white text-sky-700 rounded-full px-8 py-3 font-semibold shadow-lg hover:bg-sky-50 transition"
            >
              Search & Book Flights
            </Link>
            <Link
              href="/my-bookings"
              className="border-2 border-white text-white rounded-full px-8 py-3 font-semibold hover:bg-white/10 transition"
            >
              My Bookings
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / feature cards */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
            <p className="font-bold text-3xl text-sky-600">5</p>
            <p className="text-slate-500 mt-1">Destinations</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
            <p className="font-bold text-3xl text-sky-600">5</p>
            <p className="text-slate-500 mt-1">Light jets</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 text-center">
            <p className="font-bold text-3xl text-sky-600">6</p>
            <p className="text-slate-500 mt-1">Seats in our flagship</p>
          </div>
        </div>
      </section>

      {/* Fleet section */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Fleet</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-lg">SyberJet SJ30i</h3>
            <p className="text-slate-500 text-sm mt-1">
              Our flagship. 6 passengers in luxury on the prestige Sydney route.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-lg">Cirrus SF50</h3>
            <p className="text-slate-500 text-sm mt-1">
              Two jets, 4 seats each, serving Rotorua and Great Barrier.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-lg">HondaJet Elite</h3>
            <p className="text-slate-500 text-sm mt-1">
              Two jets, 5 seats each, serving Chatham Islands and Lake Tekapo.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}