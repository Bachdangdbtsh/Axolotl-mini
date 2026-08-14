import Fastify from "fastify";
import { userRoutes } from "./modules/users/user_route.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(userRoutes, { prefix: "/users" });

  return app;
}
