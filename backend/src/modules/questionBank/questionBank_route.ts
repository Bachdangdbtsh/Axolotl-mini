import type { FastifyInstance } from "fastify";
import { QuestionBankController } from "./questionBank_controller.js";
import { QuestionBankService } from "./questionBank_service.js";
import { QuestionBankRepository } from "./questionBank_repository.js";
import { authMiddleware } from "../users/auth/auth_middleware.js";

export async function questionBankRoutes(app: FastifyInstance) {
    const repository = new QuestionBankRepository();
    const service = new QuestionBankService(repository);
    const controller = new QuestionBankController(service);

    app.post("/", { preHandler: [authMiddleware] }, async (request, reply) => {
        return controller.create(request, reply);
    });

    app.get("/", { preHandler: [authMiddleware] }, async (request, reply) => {
        return controller.list(request, reply);
    });

    app.get("/:id", { preHandler: [authMiddleware] }, async (request, reply) => {
        return controller.getByID(request, reply);
    });

    app.put("/:id", { preHandler: [authMiddleware] }, async (request, reply) => {
        return controller.update(request, reply);
    });

    app.delete("/:id", { preHandler: [authMiddleware] }, async (request, reply) => {
        return controller.delete(request, reply);
    });
}