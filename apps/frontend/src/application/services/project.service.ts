import type { Project } from "@/domain/models/project";
import { apiGet } from "@/infrastructure/api/client";

export async function getProjects(): Promise<Project[]> {
  return apiGet<Project[]>("/projects");
}
