import type { FastifyReply } from "fastify";
import { AssignmentService } from "./assignment_service.js";
import { prisma } from "../../config/prisma.js";
import type { AuthenticatedRequest } from "../users/auth/auth_middleware.js";

export class AssignmentController {
    constructor(private assignmentService: AssignmentService) {}

    async create(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const body = request.body as {
            examID: string;
            name: string;
            startTime?: Date;
            deadline?: Date;
            duration?: number;
            maxAttempts?: number;
            showResult?: boolean;
            showCorrectAnswers: boolean;
            shuffleQuestions?: boolean;
            shuffleOptions?: boolean;
        };

        const assignment = await this.assignmentService.createAssignment(userId, {
            examID: body.examID,
            name: body.name,
            ...(body.startTime !== undefined && { startTime: body.startTime }),
            ...(body.deadline !== undefined && { deadline: body.deadline }),
            ...(body.duration !== undefined && { duration: body.duration }),
            maxAttempts: body.maxAttempts ?? 1,
            showResult: body.showResult ?? true,
            showCorrectAnswers: body.showCorrectAnswers ?? false,
            shuffleQuestions: body.shuffleQuestions ?? false,
            shuffleOptions: body.shuffleOptions ?? false,
        });

        return reply.status(201).send(assignment);
    }

    async list(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const assignments = await this.assignmentService.listAssignments(userId, user!.role);
        return reply.send(assignments);
    }

    async getByID(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { id } = request.params as { id: string };

        // Cần lấy role user
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const assignment = await this.assignmentService.getAssignmentByID(id, userId, user!.role);
        return reply.send(assignment);
    }

    async update(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { id } = request.params as { id: string };
        const body = request.body as {
            name: string;
            startTime?: string;
            deadline?: string;
            duration?: number;
            maxAttempts?: number;
            showResult?: boolean;
            showCorrectAnswers?: boolean;
            shuffleQuestions?: boolean;
            shuffleOptions?: boolean;
            status?: "BAN_NHAP" | "CHINH_THUC" | "DA_DONG";
        };

        const assignment = await this.assignmentService.updateAssignment(id, userId, {
            name: body.name,
            ...(body.startTime !== undefined && { startTime: new Date(body.startTime) }),
            ...(body.deadline !== undefined && { deadLine: new Date(body.deadline) }),
            ...(body.duration !== undefined && { duration: body.duration }),
            maxAttempt: body.maxAttempts ?? 1,
            showResult: body.showResult ?? true,
            showCorrectAnswers: body.showCorrectAnswers ?? false,
            shuffleQuestions: body.shuffleQuestions ?? false,
            shuffleOptions: body.shuffleOptions ?? false,
        });

        return reply.send(assignment);
    }

    async delete(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { id } = request.params as { id: string };

        await this.assignmentService.deleteAssignment(id, userId);
        return reply.send({ message: "Đã xóa bài giao!" });
    }

    // === AssignmentTarget ===

    async addTarget(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const body = request.body as {
            assignmentID: string;
            targetType: "CLASS" | "USER";
            classID?: string;
            userID?: string;
        };

        const target = await this.assignmentService.addTarget(userId, {
            assignmentID: body.assignmentID,
            targetType: body.targetType,
            ...(body.classID !== undefined && { classID: body.classID }),
            ...(body.userID !== undefined && { userID: body.userID }),
        });

        return reply.status(201).send(target);
    }

    async removeTarget(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { targetId } = request.params as { targetId: string };

        await this.assignmentService.deleteAssignmentTarget(userId, targetId);
        return reply.send({ message: "Đã xóa đối tượng giao bài!" });
    }
}