import Navbar from "@/components/Navbar"
import connectDB from "@/lib/mongodb";

export default async function Home() {
  await connectDB();

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Navbar />
      <main className="flex-1 flex flex-wrap items-center justify-center px-6 lg:px-24 overflow-hidden">
        <div className="max-w-3xl z-10 w-full lg:w-1/2">
          <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter pb-4 pr-4">
            Squad<span className="text-[#00FF87]">Sync</span>
          </h1>
          <div className="font-medium text-xl md:text-2xl mt-6 text-[#888888] max-w-2xl leading-relaxed">
            <p className="mb-4">An easy tool for managing your tasks and collaborating with your team.</p>
            <p className="text-white font-bold">Have a nice time building...</p>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex justify-center mt-12 lg:mt-0 relative">
            <div className="absolute inset-0 bg-[#00FF87] opacity-10 blur-[120px] rounded-full"></div>
            <img src="/logo.svg" alt="Logo" className="w-full max-w-xl max-h-[60vh] object-contain mx-auto relative z-10" />
        </div>
      </main>
    </div>
  );
}