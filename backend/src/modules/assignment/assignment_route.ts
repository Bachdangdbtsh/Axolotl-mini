import type { FastifyInstance } from "fastify";
import { AssignmentController } from "./assignment_controller.js";
import { AssignmentService } from "./assignment_service.js";
import { AssignmentRepository } from "./assignment_repository.js";
import { AssignmentTargetRepository } from "./assignmentTarget_repository.js";
import { ExamRepository } from "../examQuestion/exam_repository.js";
import { authMiddleware } from "../users/auth/auth_middleware.js";

export async function assignmentRoutes(app: FastifyInstance) {
    const assignmentRepository = new AssignmentRepository();
    const assignmentTargetRepository = new AssignmentTargetRepository();
    const examRepository = new ExamRepository();
    const assignmentService = new AssignmentService(
        assignmentRepository,
        assignmentTargetRepository,
        examRepository,
    );
    const assignmentController = new AssignmentController(assignmentService);

    // Assignment CRUD
    app.post("/", { preHandler: [authMiddleware] }, async (request, reply) => {
        return assignmentController.create(request, reply);
    });

    app.get("/", { preHandler: [authMiddleware] }, async (request, reply) => {
        return assignmentController.list(request, reply);
    });

    app.get("/:id", { preHandler: [authMiddleware] }, async (request, reply) => {
        return assignmentController.getByID(request, reply);
    });

    app.put("/:id", { preHandler: [authMiddleware] }, async (request, reply) => {
        return assignmentController.update(request, reply);
    });

    app.delete("/:id", { preHandler: [authMiddleware] }, async (request, reply) => {
        return assignmentController.delete(request, reply);
    });

    // AssignmentTarget
    app.post("/targets", { preHandler: [authMiddleware] }, async (request, reply) => {
        return assignmentController.addTarget(request, reply);
    });

    app.delete("/targets/:targetId", { preHandler: [authMiddleware] }, async (request, reply) => {
        return assignmentController.removeTarget(request, reply);
    });
}