export interface Project {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}
