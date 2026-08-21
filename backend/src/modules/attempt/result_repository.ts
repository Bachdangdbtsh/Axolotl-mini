import { prisma } from "../../config/prisma.js"

export class ResultRepository {
    async findByAttempt(attemptID: string) {
        return prisma.result.findUnique({
            where: {attemptID},
        });
    }

    async createResult(data: {
        attemptID: string,
        score: number,
        totalPoints: number, 
        percentage: number,
    }) {
        return prisma.result.create({data});
    }
}