import { prisma } from "../../config/prisma.js"

export class QuestionBankRepository {
    async findByID(id: string) {
        return prisma.questionBank.findUnique({
            where: { id },
            include: { 
                questions: { 
                    include: { options: true } 
                } 
            },
        });
    }

    async listByOwner(ownerID: string) {
        return prisma.questionBank.findMany( {
            where: { ownerID },
            include: {
                questions: {
                    include: { options: true },
                },
            },
        });
    }

    async createQuestionBank(data: { name: string, ownerID: string }) {
        return prisma.questionBank.create({data});
    }

    async updateQuestionBank(id: string, data: { name?: string }) {
        return prisma.questionBank.update({
            where: {id},
            data,
        });
    }

    async deleteQuestionBank(id: string) {
        return prisma.questionBank.delete({
            where: {id}
        });
    }
}