import type { FastifyInstance } from "fastify";
import { ExamController } from "./exam_controller.js";
import { ExamService } from "./exam_service.js";
import { ExamRepository } from "./exam_repository.js";
import { ExamQuestionRepository } from "./examQuestion_repository.js";
import { QuestionRepository } from "../question/question_repository.js";
import { authMiddleware } from "../users/auth/auth_middleware.js";

export async function examRoutes(app: FastifyInstance) {
    const examRepository = new ExamRepository();
    const examQuestionRepository = new ExamQuestionRepository();
    const questionRepository = new QuestionRepository();
    const examService = new ExamService(
        examQuestionRepository,
        examRepository,
        questionRepository,
    );
    const examController = new ExamController(examService);

    // Exam CRUD
    app.post("/", { preHandler: [authMiddleware] }, async (request, reply) => {
        return examController.create(request, reply);
    });

    app.get("/", { preHandler: [authMiddleware] }, async (request, reply) => {
        return examController.list(request, reply);
    });

    app.get("/:id", { preHandler: [authMiddleware] }, async (request, reply) => {
        return examController.getByID(request, reply);
    });

    app.put("/:id", { preHandler: [authMiddleware] }, async (request, reply) => {
        return examController.update(request, reply);
    });

    app.delete("/:id", { preHandler: [authMiddleware] }, async (request, reply) => {
        return examController.delete(request, reply);
    });

    // ExamQuestion management
    app.post("/:id/questions", { preHandler: [authMiddleware] }, async (request, reply) => {
        return examController.addQuestion(request, reply);
    });

    app.put("/questions/:examQuestionId", { preHandler: [authMiddleware] }, async (request, reply) => {
        return examController.updateQuestion(request, reply);
    });

    app.delete("/questions/:examQuestionId", { preHandler: [authMiddleware] }, async (request, reply) => {
        return examController.removeQuestion(request, reply);
    });
}