import { includes } from "zod"
import { prisma } from "../../config/prisma.js"

export class ExamRepository {
    async findByID(id: string) {
        return prisma.exam.findUnique({    
            where: {id},
            include: {
                examQuestions: {
                    include: { question: { include: { options: true } } },
                    orderBy: { order: "asc" },
                }
            }}
        )
    }

    async listByOwner(ownerID: string) {
        return prisma.exam.findMany({
            where: {ownerID},
            include: {
                examQuestions: {
                    include: { question: true },
                    orderBy: { order: "asc" }
                }
            }
        })
    }

    async createExam(data: {
        name: string,
        description: string,
        ownerID: string
    }) {
        return prisma.exam.create({data});
    }

    async updateExam(id: string, data: {
        name: string, 
        description: string
    }) {
        return prisma.exam.update({
            where: {id},
            data,
        });
    }

    async deleteExam(id: string) {
        return prisma.exam.delete({
            where: {id}
        });
    }
   
}