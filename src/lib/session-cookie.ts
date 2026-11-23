/** Edge-safe constants shared by middleware and server code. */
export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-nv_admin" : "nv_admin";
