import Fastify from "fastify";
import { userRoutes } from "./modules/users/user_route.js";
import { authRoutes } from "./modules/users/auth/auth_route.js";
export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(userRoutes, { prefix: "/users" });
  app.register(authRoutes, { prefix: "/auth"})

  return app;
}
