import type { FastifyReply } from "fastify";
import { QuestionService } from "./question_service.js";
import type { AuthenticatedRequest } from "../users/auth/auth_middleware.js";
import type { DifficultyType, QuestionType } from "../../generated/prisma/enums.js";

export class QuestionController {
    constructor(private questionService: QuestionService) {}

    async create(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const body = request.body as {
            questionBankID: string;
            content: string;
            type: QuestionType;
            difficulty: DifficultyType;
            points: number;
            correctAnswer: string;
            options: { label: string; content: string }[];
        };

        const question = await this.questionService.createQuestion(userId, {
            questionBankID: body.questionBankID,
            content: body.content,
            type: body.type,
            difficulty: body.difficulty || "THONG_HIEU",
            points: body.points || 1,
            correctAnswer: body.correctAnswer,
            options: body.options,
        });

        return reply.status(201).send(question);
    }

    async getByID(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { id } = request.params as { id: string };

        const question = await this.questionService.getQuestionByID(id, userId);
        return reply.send(question);
    }

    async listByBank(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { bankId } = request.params as { bankId: string };

        const questions = await this.questionService.listQuestionByBank(bankId, userId);
        return reply.send(questions);
    }

    async update(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { id } = request.params as { id: string };
        const body = request.body as {
            content?: string;
            type?: QuestionType;
            difficulty?: DifficultyType;
            points?: number;
            correctAnswer?: string;
            options?: { label: string; content: string }[];
        };

        const question = await this.questionService.updateQuestion(id, userId, body);
        return reply.send(question);
    }

    async delete(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { id } = request.params as { id: string };

        await this.questionService.deleteQuestion(id, userId);
        return reply.send({ message: "Đã xóa câu hỏi!" });
    }
}