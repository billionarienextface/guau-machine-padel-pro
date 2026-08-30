import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      <Image
        src="/backgrounds/hero-padel-court.png"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Image
          src="/guau-logo.png"
          alt="GUAU"
          width={280}
          height={280}
          className="mb-6"
          style={{
            filter:
              "drop-shadow(0 0 28px rgba(255, 0, 0, 0.55)) drop-shadow(0 0 60px rgba(255, 0, 0, 0.3))",
          }}
          priority
        />
        <h2 className="font-display text-2xl md:text-4xl tracking-wide text-white uppercase mb-4">
          DE INVISIBLE A INEVITABLE EN LA PISTA
        </h2>
        <p className="text-gray-300 text-sm md:text-base tracking-widest uppercase mb-8">
          AI Padel Coach • Miami • iPhone + Apple Watch
        </p>
        <div className="flex gap-8 mb-10 text-center">
          <div>
            <div className="text-[#FF6B00] font-display text-3xl">8</div>
            <div className="text-xs uppercase tracking-wide">Clubs Miami</div>
          </div>
          <div>
            <div className="text-[#FF6B00] font-display text-3xl">25</div>
            <div className="text-xs uppercase tracking-wide">Puntos Audit</div>
          </div>
          <div>
            <div className="text-[#FF6B00] font-display text-3xl">$2,391</div>
            <div className="text-xs uppercase tracking-wide">MRR</div>
          </div>
        </div>
        <Link
          href="/machine"
          className="bg-[#FF6B00] text-black px-10 py-4 rounded-full font-display text-xl uppercase tracking-wide hover:bg-white transition"
        >
          ENTRENAR AHORA
        </Link>
        <p className="mt-6 text-xs text-gray-500 uppercase tracking-wide">
          Lujo que ladra • Street Luxury • Miami 2026
        </p>
      </div>
    </div>
  );
}
