import { GamesPageClient } from "./GamesPageClient";

export default function GamesPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-50">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/50 sm:p-12">
        <GamesPageClient />
      </div>
    </main>
  );
}
