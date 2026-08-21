import {prisma} from "../../config/prisma.js"
import { AttemptStatus } from "../../generated/prisma/enums.js";

export class AttemptRepository {
    async findByID(id: string) {
        return prisma.attempt.findUnique({
            where: {id},
            include: {
                assignment: true,
                answers: {
                    include: {
                        examQuestion: { include: {question: true} }
                    }
                },
                result: true
            },
        });
    }

    async listByAssignmentAndStudent(assignmentID: string, studentID: string) {
        return prisma.attempt.findMany({
            where: { assignmentID, studentID },
            include: { result: true },
            orderBy: {startedAt: "asc"},
        });
    }

    async countByAssignmentAndStudent(assignmentID: string, studentID: string) {
        return prisma.attempt.count({
            where: {assignmentID, studentID},
        });
    }

    async createAttempt(data: {
        assignmentID: string,
        studentID: string,
    }) {
        return prisma.attempt.create({
            data: {
                ...data,
                status: AttemptStatus.DANG_THUC_HIEN,
            }
        });
    }

    async updateStatus(id: string, status: AttemptStatus) {
        return prisma.attempt.update({
            where: {id},
            data: {
                status,
                ...(status == AttemptStatus.DA_NOP_BAI ? {submittedAt: new Date()} : {}),
            }
        })
    }
}