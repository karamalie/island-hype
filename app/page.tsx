export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-cyan-50 to-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-cyan-600 mb-4">
          🏝️ Island Hype
        </h1>
        <p className="text-xl text-gray-600 mb-8">Maldives Travel Packages</p>
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm">
          <span className="animate-pulse">●</span>
          Setting up...
        </div>
      </div>
    </div>
  );
}
