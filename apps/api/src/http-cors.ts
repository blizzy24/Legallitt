/** The same browser contract is used by the API and local acceptance server. */
export function httpCorsOptions(origins: string[]) {
  return {
    origin: origins,
    allowedHeaders: ["Authorization", "Content-Type", "Idempotency-Key"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  };
}
