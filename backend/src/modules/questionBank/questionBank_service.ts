import { QuestionBankRepository } from "./questionBank_repository.js";

export class QuestionBankService {
    constructor(
        private questionBankRepository : QuestionBankRepository
    ) {};

    async createQuestionBank(data: {
        ownerID: string,
        name: string
    }) {
        return this.questionBankRepository.createQuestionBank(data);
    }

    async getQuestionBankByID(id: string, userID: string) {
        const questionBank = await this.questionBankRepository.findByID(id);

        if (!questionBank) {
            throw new Error("Không tìm thấy ngân hàng câu hỏi!");
        }
        if (questionBank.ownerID !== userID) {
            throw new Error("Bạn không có quyền xem ngân hàng này!");
        }
        return questionBank;
    }

    async listmyQuestionBanks(ownerID: string) {
        return this.questionBankRepository.listByOwner(ownerID);
    }

    async updateQuestionBank(id: string, userID: string, data: { name?: string }) {
        const questionBank = await this.questionBankRepository.findByID(id);
        if (!questionBank) {
            throw new Error("Không tìm thấy ngân hàng câu hỏi!");
        }

        if (questionBank.ownerID != userID) {
            throw new Error("Bạn không có quyền truy cập để cập nhật ngân hàng câu hỏi này!");
        }
        return this.questionBankRepository.updateQuestionBank(id, data);
    }

    async deleteQuestionBank(id: string, userID: string) {
        const questionBank = await this.questionBankRepository.findByID(id);
        if (!questionBank) {
            throw new Error("Không tìm thấy ngân hàng câu hỏi!");
        }

        if (questionBank.ownerID != userID) {
            throw new Error("Bạn không có quyền truy cập để cập nhật ngân hàng câu hỏi này!");
        }
        return this.questionBankRepository.deleteQuestionBank(id);
    }
}