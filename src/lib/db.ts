import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL || "postgres://appistic_dev:appistic_dev@127.0.0.1:5432/appistic_dev";
const client = postgres(url, { max: 10 });
export const db = drizzle(client, { schema });
export { schema };
