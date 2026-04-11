"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/domain/models/project";
import { getProjects } from "@/application/services/project.service";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold text-zinc-900">Projects</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {projects.length === 0 ? (
          <p className="text-zinc-500">No projects yet</p>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <h2 className="font-semibold">{p.name}</h2>
              <p className="mt-1 text-sm text-zinc-600">{p.description}</p>
              <span className="mt-2 inline-block rounded bg-zinc-100 px-2 py-0.5 text-xs">
                {p.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
