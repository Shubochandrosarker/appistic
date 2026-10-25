import { assertProductionConfig } from "@/lib/config";

export function register() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_RUNTIME === "nodejs") assertProductionConfig();
}
