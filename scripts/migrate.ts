import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for migrations.");

const sql = postgres(databaseUrl, { max: 1 });
const migrationDirectory = path.resolve(process.cwd(), "drizzle");
const migrationFiles = fs
  .readdirSync(migrationDirectory)
  .filter((name) => /^\d+_.+\.sql$/.test(name))
  .sort();

async function main() {
try {
  await sql`create table if not exists appistic_migrations (
    version text primary key,
    checksum text not null,
    applied_at timestamptz not null default now()
  )`;

  for (const file of migrationFiles) {
    const version = file.slice(0, file.indexOf("_"));
    const contents = fs.readFileSync(path.join(migrationDirectory, file), "utf8");
    const checksum = crypto.createHash("sha256").update(contents).digest("hex");
    const [existing] = await sql`select checksum from appistic_migrations where version = ${version}`;
    if (existing) {
      if (existing.checksum !== checksum) throw new Error(`Migration checksum mismatch for ${file}.`);
      continue;
    }

    const statements = contents
      .split(/--+\s*statement-breakpoint\s*/i)
      .map((statement) => statement.trim())
      .filter(Boolean);
    await sql.begin(async (tx) => {
      for (const statement of statements) await tx.unsafe(statement);
      await tx`insert into appistic_migrations (version, checksum) values (${version}, ${checksum})`;
    });
    console.log(`Applied ${file}`);
  }
} finally {
  await sql.end({ timeout: 5 });
}
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
