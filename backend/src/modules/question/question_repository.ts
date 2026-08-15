import { prisma } from "../../config/prisma.js";
import type { DifficultyType, QuestionType } from "../../generated/prisma/enums.js";

export class QuestionRepository {
    async findByID(id: string) {
        return prisma.question.findUnique({
            where: { id },
            include: { options: true },
        });
    }

    async listByQuestionBank(questionBankID: string) {
        return prisma.question.findMany({
            where: { questionBankID },
            include: { options: true },
        });
    }

    async createQuestion(data: {
        questionBankID: string;
        content: string;
        type: QuestionType;
        difficulty: DifficultyType;
        points: number;
        correctAnswer: string;
    }) {
        return prisma.question.create({
            data: {
                questionBank: { connect: { id: data.questionBankID } },
                content: data.content,
                type: data.type,
                difficulty: data.difficulty,
                points: data.points,
                correctAnswer: data.correctAnswer,
            },
        });
    }

    async updateQuestion(id: string, data: {
        content?: string;
        type?: QuestionType;
        difficulty?: DifficultyType;
        points?: number;
        correctAnswer?: string;
    }) {
        return prisma.question.update({
            where: { id },
            data,
            include: { options: true },
        });
    }

    async deleteQuestion(id: string) {
        return prisma.question.delete({
            where: { id },
        });
    }
}