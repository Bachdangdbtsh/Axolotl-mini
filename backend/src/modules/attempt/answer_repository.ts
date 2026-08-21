import { prisma } from "../../config/prisma.js"

export class AnswerRepository {
    async findByAttemptAndQuestion(attemptID: string, examQuestionID: string) {
        return prisma.answer.findFirst({
            where: {attemptID, examQuestionID}
        });
    }

    async createOrUpdate(data: {
        attemptID: string;
        examQuestionID: string;
        content: string;
    }) {
        const existing = await this.findByAttemptAndQuestion(data.attemptID, data.examQuestionID);
        if (existing) {
            if (existing.content !== data.content) {
                return prisma.answer.update({
                    where: {id: existing.id},
                    data: {content: data.content},
                });
            }
        }
        return prisma.answer.create({data});
    }

    async listByAttempt(attemptID: string) {
        return prisma.answer.findMany({
            where: {attemptID},
            include: {
                examQuestion: { include: {exam: true} },
            },
        });
    }
}