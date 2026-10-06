import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL || "postgres://bos_app:AppPG2026Strong%21x@127.0.0.1:55432/bos_app";
const client = postgres(url, { max: 10 });
export const db = drizzle(client, { schema });
export { schema };
