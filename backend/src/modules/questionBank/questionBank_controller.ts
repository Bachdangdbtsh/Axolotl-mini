import type { FastifyReply } from "fastify";
import { QuestionBankService } from "./questionBank_service.js";
import type { AuthenticatedRequest } from "../users/auth/auth_middleware.js";

export class QuestionBankController {
    constructor (private questionBankService: QuestionBankService) {};

    async create(request: AuthenticatedRequest, reply: FastifyReply) {
        const userID = request.user!.userId;
        const body = request.body as {name: string};

        const newQuestionBankController = await this.questionBankService.createQuestionBank({
            name: body.name,
            ownerID: userID,
        });
         return reply.status(201).send(newQuestionBankController);
    }

    async list (request: AuthenticatedRequest, reply: FastifyReply) {
        const userID = request.user!.userId;
        const questionBank = await this.questionBankService.listmyQuestionBanks(userID);
        return reply.send(questionBank);
    }

    async getByID(request: AuthenticatedRequest, reply: FastifyReply) {
        const userID = request.user!.userId;
        const { id }= request.params as {id: string};
        const questionBankData = await this.questionBankService.getQuestionBankByID(id, userID);
        return reply.send(questionBankData);
    }

    async update(request: AuthenticatedRequest, reply: FastifyReply) {
        const userID = request.user!.userId;
        const { id }= request.params as {id: string};
        const name = request.body as {name: string};

        const questionBankUpdated = await this.questionBankService.updateQuestionBank(id, userID, name);
        return reply.send(questionBankUpdated);
    }

    async delete(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { id } = request.params as { id: string };

        await this.questionBankService.deleteQuestionBank(id, userId);
        return reply.send({ message: "Đã xóa ngân hàng câu hỏi!" });
    }  
}