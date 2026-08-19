import type { FastifyReply } from "fastify";
import { ExamService } from "./exam_service.js";
import type { AuthenticatedRequest } from "../users/auth/auth_middleware.js";

export class ExamController {
    constructor(private examService: ExamService) {}

    async create(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const body = request.body as { name: string; description: string };

        const exam = await this.examService.createExam({
            name: body.name,
            description: body.description,
            ownerID: userId,
        });

        return reply.status(201).send(exam);
    }

    async list(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const exams = await this.examService.listExamByOwner(userId);
        return reply.send(exams);
    }

    async getByID(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { id } = request.params as { id: string };

        const exam = await this.examService.getExamByID(id, userId);
        return reply.send(exam);
    }

    async update(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { id } = request.params as { id: string };
        const body = request.body as { name: string; description: string };

        const exam = await this.examService.updateExam(id, userId, body);
        return reply.send(exam);
    }

    async delete(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { id } = request.params as { id: string };

        await this.examService.deleteExam(id, userId);
        return reply.send({ message: "Đã xóa đề thi!" });
    }

    // === ExamQuestion ===

    async addQuestion(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { id: examID } = request.params as { id: string };
        const body = request.body as {
            questionID: string;
            order: number;
            points: number;
        };
        

        const examQuestion = await this.examService.addQuestionToExam(userId, {
            examID,
            ...body,
        });

        return reply.status(201).send(examQuestion);
    }

    async updateQuestion(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { examQuestionId } = request.params as { examQuestionId: string };
        const body = request.body as { order: number; points: number };

        const examQuestion = await this.examService.updateExamQuestion(
            examQuestionId,
            userId,
            body,
        );

        return reply.send(examQuestion);
    }

    async removeQuestion(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { examQuestionId } = request.params as { examQuestionId: string };

        await this.examService.deleteExamQuestion(examQuestionId, userId);
        return reply.send({ message: "Đã xóa câu hỏi khỏi đề thi!" });
    }
}