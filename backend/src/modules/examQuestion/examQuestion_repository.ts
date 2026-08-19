import type { ZodNumberFormat } from "zod";
import { prisma } from "../../config/prisma.js"
import { ExamRepository } from "./exam_repository.js"

export class ExamQuestionRepository {
    async findByID(id: string) {
        return prisma.examQuestion.findUnique({
            where: {id},
            include: {
                question: { include: { options: true } } ,
            }
        });
    }

    async listByExam(examID: string) {
        return prisma.examQuestion.findMany({
            where: {examID},
            include: { 
                question: { include: { options: true } } 
            },
            orderBy: { order: "asc" },
        });
    }

    async findByExamAndQuestion(examID: string, questionID: string) {
        return prisma.examQuestion.findUnique( {
            where: {
                examID_questionID: {examID, questionID}
            },
        });
    }

    async createExamQuestion(data: {
        examID: string,
        questionID: string,
        order: number,
        points: number
    }) {
        return prisma.examQuestion.create({data});
    }

    async updateExamQuestion(id: string, data: {
        order: number,
        points: number
    }) {
        return prisma.examQuestion.update({
            where: {id},
            data
        });
    }

    async deleteExamQuestion(id: string) {
        return prisma.examQuestion.delete({ where: {id} });
    }

    async deleteByExamID(examID: string) {
    return prisma.examQuestion.deleteMany({
        where: { examID },
    });
}
}