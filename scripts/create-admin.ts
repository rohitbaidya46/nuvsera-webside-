/* eslint-disable no-console */
// Usage: npm run create-admin -- "Full Name" email@example.com SUPER_ADMIN
// Creates a user and prints a one-time password-setup link (valid 48h).
import { PrismaClient, type Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";

const prisma = new PrismaClient();
const [name, email, role = "SUPER_ADMIN"] = process.argv.slice(2);

async function main() {
  if (!name || !email) throw new Error('Usage: npm run create-admin -- "Full Name" email@example.com [SUPER_ADMIN|ADMIN|SALES|CONTENT_EDITOR]');
  if (!["SUPER_ADMIN", "ADMIN", "SALES", "CONTENT_EDITOR"].includes(role)) throw new Error("Invalid role");
  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), role: role as Role, passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), 12) },
  });
  const token = randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(Date.now() + 48 * 3600 * 1000) },
  });
  console.log(`✔ Created ${role} ${user.email}`);
  console.log(`  Set password (valid 48h): ${(process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "")}/admin/reset-password?token=${token}`);
}
main().catch((e) => { console.error(e.message); process.exit(1); }).finally(() => prisma.$disconnect());
