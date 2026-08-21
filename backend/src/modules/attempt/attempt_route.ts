import type { FastifyInstance } from "fastify";
import { AttemptController } from "./attempt_controller.js";
import { AttemptService } from "./attempt_service.js";
import { AttemptRepository } from "./attempt_repository.js";
import { AnswerRepository } from "./answer_repository.js";
import { ResultRepository } from "./result_repository.js";
import { AssignmentRepository } from "../assignment/assignment_repository.js";
import { ExamQuestionRepository } from "../examQuestion/examQuestion_repository.js";
import { authMiddleware } from "../users/auth/auth_middleware.js";

export async function attemptRoutes(app: FastifyInstance) {
    const attemptRepository = new AttemptRepository();
    const answerRepository = new AnswerRepository();
    const resultRepository = new ResultRepository();
    const assignmentRepository = new AssignmentRepository();
    const examQuestionRepository = new ExamQuestionRepository();
    const attemptService = new AttemptService(
        attemptRepository,
        answerRepository,
        resultRepository,
        assignmentRepository,
        examQuestionRepository,
    );
    const attemptController = new AttemptController(attemptService);


    app.post("/assignments/:id/start", { preHandler: [authMiddleware] }, async (request, reply) => {
        return attemptController.start(request, reply);
    });


    app.post("/attempts/:id/answers", { preHandler: [authMiddleware] }, async (request, reply) => {
        return attemptController.saveAnswer(request, reply);
    });


    app.post("/attempts/:id/submit", { preHandler: [authMiddleware] }, async (request, reply) => {
        return attemptController.submit(request, reply);
    });


    app.get("/attempts/:id/result", { preHandler: [authMiddleware] }, async (request, reply) => {
        return attemptController.getResult(request, reply);
    });
}