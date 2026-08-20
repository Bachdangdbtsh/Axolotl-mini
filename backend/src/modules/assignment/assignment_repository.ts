import {prisma} from "../../config/prisma.js"

export class AssignmentRepository {
    async findByID(id: string) {
        return prisma.assignment.findUnique({
            where: {id},
            include: {
                exam: {
                    include: {
                        examQuestions: {
                            include: { 
                                question: { include: { options: true } } },
                            orderBy: { order: "asc" },
                        },
                    },
                },
                targets: true,
                attempts: true,
            }
        });
    }

    async listByTeacher(teacherID: string) {
        return prisma.assignment.findMany({
            where: {
                exam: { ownerID: teacherID },
            },
            include: {
                exam: {select: {id: true, name: true}},
                targets: true,
                _count: {select: {attempts: true}},
            },
        });
    }

    async listByStudent(studentID: string) {
        return prisma.assignment.findMany({
            where: {
                OR: [
                    {
                        targets: {
                            some: {
                                targetType: "USER",
                                userID: studentID,
                            },
                        },
                    },
                    {
                        targets: {
                            some: {
                                targetType: "CLASS",
                                class: {
                                    members: {
                                        some: {
                                            userID: studentID,
                                            role: "STUDENT",
                                        },
                                    },
                                },
                            },
                        },
                    },
                ],
                status: "CHINH_THUC",
            },
            include: {
                exam: {
                    select: {id: true, name: true}
                },
                attempts: {
                    where: {studentID}
                }
            }
        });
    }

    async createAssignment(data: {
        examID: string,
        name: string,
        startTime?: Date | undefined,
        deadLine?: Date | undefined,
        duration?: number | undefined,
        maxAttempt: number,
        showResult: boolean,
        showCorrectAnswers: boolean,
        shuffleQuestions: boolean,
        shuffleOptions: boolean
    }) {
        return prisma.assignment.create({
            data: {
                examID: data.examID,
                name: data.name,
                ...(data.startTime !== undefined ? {startTime: data.startTime} : {}),
                ...(data.deadLine !== undefined ? {deadLine: data.deadLine} : {}),
                ...(data.duration !== undefined ? {duration: data.duration} : {}),
                maxAttempt: data.maxAttempt,
                showResult: data.showResult,
                showCorrectAnswers: data.showCorrectAnswers,
                shuffleQuestions: data.shuffleQuestions,
                shuffleOptions: data.shuffleOptions,
                status: "BAN_NHAP"
            }
        });
    }

    async updateAssignment(id: string, data: {
        name: string,
        startTime?: Date,
        deadLine?: Date,
        duration?: number,
        maxAttempt: number,
        showResult: boolean,
        showCorrectAnswers: boolean,
        shuffleQuestions: boolean,
        shuffleOptions: boolean
    }) {
        return prisma.assignment.update({
            where: {id},
            data,
        });
    }

    async deleteAssignment(id: string) {
        return prisma.assignment.delete({
            where: {id},
        });
    }
}