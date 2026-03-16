import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8">
      <main className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-zinc-900">Sabilouna</h1>
        <p className="mt-4 text-lg text-zinc-600">
          Project & Journey Tracking SaaS — Clean Architecture
        </p>
        <Link
          href="/projects"
          className="mt-8 inline-block rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800"
        >
          Projects
        </Link>
      </main>
    </div>
  );
}
