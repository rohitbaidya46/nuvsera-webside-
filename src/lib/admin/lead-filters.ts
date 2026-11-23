import type { Prisma } from "@prisma/client";
import { LEAD_STATUSES } from "../constants";

export type LeadQuery = { q?: string; status?: string; service?: string; source?: string; assignee?: string; from?: string; to?: string; page?: string };

export function leadWhere(p: LeadQuery, currentUserId?: string): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};
  if (p.q) {
    const q = p.q.slice(0, 100);
    where.OR = ["name", "email", "company", "phone", "message"].map((f) => ({ [f]: { contains: q, mode: "insensitive" } }));
  }
  if (p.status && (LEAD_STATUSES as readonly string[]).includes(p.status)) where.status = p.status as (typeof LEAD_STATUSES)[number];
  if (p.service) where.service = p.service;
  if (p.source) where.source = p.source;
  if (p.assignee === "me" && currentUserId) where.assignedToId = currentUserId;
  else if (p.assignee === "none") where.assignedToId = null;
  else if (p.assignee) where.assignedToId = p.assignee;
  const created: Prisma.DateTimeFilter = {};
  if (p.from && !isNaN(Date.parse(p.from))) created.gte = new Date(`${p.from}T00:00:00+05:30`);
  if (p.to && !isNaN(Date.parse(p.to))) created.lte = new Date(`${p.to}T23:59:59+05:30`);
  if (created.gte || created.lte) where.createdAt = created;
  return where;
}
