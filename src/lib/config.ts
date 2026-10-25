const REQUIRED_PRODUCTION_ENV = ["DATABASE_URL", "AUTH_SECRET", "PUBLIC_BASE_URL"] as const;

export function missingProductionConfig(env: Record<string, string | undefined> = process.env) {
  return REQUIRED_PRODUCTION_ENV.filter((name) => {
    const value = env[name]?.trim();
    return !value || (name === "AUTH_SECRET" && (value.length < 32 || value.includes("replace") || value.includes("change-me")));
  });
}

export function assertProductionConfig(env: Record<string, string | undefined> = process.env) {
  const missing = missingProductionConfig(env);
  if (missing.length) throw new Error(`Missing required production configuration: ${missing.join(", ")}`);
}
