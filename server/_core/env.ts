export const ENV = {
  get databaseUrl() { return process.env.DATABASE_URL ?? ""; },
  get isProduction() { return process.env.NODE_ENV === "production"; },
  get forgeApiUrl() { return process.env.BUILT_IN_FORGE_API_URL ?? ""; },
  get forgeApiKey() { return process.env.BUILT_IN_FORGE_API_KEY || process.env.OPENAI_API_KEY || ""; },
  get openaiApiKey() { return process.env.OPENAI_API_KEY ?? ""; },
};
