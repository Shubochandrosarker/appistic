import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { organizationMembers, organizations } from "./schema";

export const ORG_ROLES = ["owner", "admin", "editor", "viewer"] as const;
export type OrgRole = (typeof ORG_ROLES)[number];
const ROLE_RANK: Record<OrgRole, number> = { viewer: 10, editor: 20, admin: 30, owner: 40 };

export async function getPersonalOrganization(userId: string) {
  const [row] = await db
    .select({ org: organizations, role: organizationMembers.role })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.orgId))
    .where(and(eq(organizationMembers.userId, userId), eq(organizationMembers.role, "owner")))
    .limit(1);
  return row?.org || null;
}

export async function requireOrgRole(userId: string, orgId: string, minimum: OrgRole = "viewer") {
  const [row] = await db
    .select({ org: organizations, role: organizationMembers.role })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.orgId))
    .where(and(eq(organizationMembers.userId, userId), eq(organizationMembers.orgId, orgId)))
    .limit(1);
  if (!row || row.org.status !== "active" || !(row.role in ROLE_RANK) || ROLE_RANK[row.role as OrgRole] < ROLE_RANK[minimum]) return null;
  return { ...row.org, role: row.role as OrgRole };
}
