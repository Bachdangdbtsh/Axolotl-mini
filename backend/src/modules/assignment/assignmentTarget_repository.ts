import { prisma } from "../../config/prisma.js"

export class AssignmentTargetRepository {
    async findByID(id: string) {
        return prisma.assignmentTarget.findUnique({
            where: {id},
            include: { class: true, user: true },
        });
    }

    async listByAssignment(assignmentID: string) {
        return prisma.assignmentTarget.findMany({
            where: {assignmentID},
            include: {class: true, user: true}
        });
    }

    async createAssignmentTarget(data: {
        assignmentID: string;
        targetType: "CLASS" | "USER";
        classID?: string;
        userID?: string;
    }) {
        return prisma.assignmentTarget.create({data});
    }

    async deleteAssignmentTarget(id: string) {
        return prisma.assignmentTarget.delete({
            where: {id},
        });
    }

    async deleteByAssignment(assignmentID: string) {
    return prisma.assignmentTarget.deleteMany({
        where: { assignmentID },
    });
}
}