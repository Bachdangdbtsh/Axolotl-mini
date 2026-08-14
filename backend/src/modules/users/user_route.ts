import type { FastifyInstance } from "fastify";
import { UserController } from "./user_controller.js";
import { UserService } from "./user_service.js";
import { UserRepository } from "./user_repository.js";
import { authMiddleware } from "../users/auth/auth_middleware.js";
import { request } from "node:http";


export async function userRoutes(
    app: FastifyInstance
) {

    const repository = new UserRepository();
    const service = new UserService(repository);
    const controller = new UserController(service);

    app.get("/users/:id", async (request, reply) => {
        return controller.getUser(request, reply);
    });

    app.get("user/me", { preHandler: [authMiddleware] }, async (request, reply) => {
        return controller.getMe(request, reply)
    })
}