import type { FastifyInstance } from "fastify";
import { QuestionController } from "./question_controller.js";
import { QuestionService } from "./question_service.js";
import { QuestionRepository } from "./question_repository.js";
import { QuestionOptionRepository } from "./questionOption_repository.js";
import { QuestionBankRepository } from "../questionBank/questionBank_repository.js";
import { authMiddleware } from "../users/auth/auth_middleware.js";

export async function questionRoutes(app: FastifyInstance) {
    const questionRepository = new QuestionRepository();
    const questionOptionRepository = new QuestionOptionRepository();
    const questionBankRepository = new QuestionBankRepository();

    const questionService = new QuestionService(
        questionRepository,
        questionBankRepository,
        questionOptionRepository,
    );
    const questionController = new QuestionController(questionService);

    app.post("/", { preHandler: [authMiddleware] }, async (request, reply) => {
        return questionController.create(request, reply);
    });

    app.get("/:id", { preHandler: [authMiddleware] }, async (request, reply) => {
        return questionController.getByID(request, reply);
    });

    app.get("/bank/:bankId", { preHandler: [authMiddleware] }, async (request, reply) => {
        return questionController.listByBank(request, reply);
    });

    app.put("/:id", { preHandler: [authMiddleware] }, async (request, reply) => {
        return questionController.update(request, reply);
    });

    app.delete("/:id", { preHandler: [authMiddleware] }, async (request, reply) => {
        return questionController.delete(request, reply);
    });
}