import Fastify from "fastify";
import { prisma } from "./config/prisma.js";
import { userRoutes } from "./modules/users/user_route.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.get("/users", async () => {
    return prisma.user.findMany();
  });

  return app;
}