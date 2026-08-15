import { prisma } from "../../config/prisma.js";

export class QuestionOptionRepository {
    async create(data: {
        questionID: string;
        label: string;
        content: string;
    }) {
        return prisma.questionOption.create({ data });
    }

    async deleteByQuestion(questionID: string) {
        return prisma.questionOption.deleteMany({
            where: { questionID },
        });
    }
}