import { QuestionRepository } from "./question_repository.js";
import { prisma } from "../../config/prisma.js"
import type { DifficultyType, QuestionType } from "../../generated/prisma/enums.js";
import { QuestionOptionRepository } from "./questionOption_repository.js";
import { QuestionBankRepository } from "../questionBank/questionBank_repository.js";

export class QuestionService {
    constructor(
        private questionRepository : QuestionRepository,
        private questionBankRepository : QuestionBankRepository,
        private questionOptionRepository : QuestionOptionRepository
    ) {};

    async createQuestion(userID: string, data: {
        questionBankID: string;
        content: string;
        type: QuestionType;
        difficulty: DifficultyType;
        points: number;
        correctAnswer: string;
        options: { label: string; content: string }[];
    }) {
        const questionBank = await this.questionBankRepository.findByID(data.questionBankID);
        if (!questionBank) {
            throw new Error("Không tìm thấy ngân hàng câu hỏi");
        }
        
        if (questionBank.ownerID !== userID) {
            throw new Error("Bạn không có quyền thêm câu hỏi vào ngân hàng này!");
        }
        
        const question = await this.questionRepository.createQuestion(data);

        if (data.options && data.options.length > 0) {
            for (const option of data.options) {
                await this.questionOptionRepository.create({
                    questionID: question.id,
                    label: option.label,
                    content: option.content,
                });
            }
        }
        return this.questionRepository.findByID(question.id);
    }

    async getQuestionByID(id: string, userID: string) {
        const question = await this.questionRepository.findByID(id);
        if (!question) {
            throw new Error("Không tìm thấy câu hỏi");
        }

        const questionBank = await this.questionBankRepository.findByID(question.questionBankID);
        if (!questionBank) {
            throw new Error("Không tìm thấy ngân hàng câu hỏi");
        }
        
        if (questionBank.ownerID !== userID) {
            throw new Error("Bạn không có quyền thêm câu hỏi vào ngân hàng này!");
        }
        return question;
    }

    async listQuestionByBank(questionBankID: string, userID: string) {
        const questionBank = await this.questionBankRepository.findByID(questionBankID);
        if (!questionBank) {
            throw new Error("Không tìm thấy ngân hàng câu hỏi");
        }
        
        if (questionBank.ownerID !== userID) {
            throw new Error("Bạn không có quyền thêm câu hỏi vào ngân hàng này!");
        }

        return this.questionRepository.listByQuestionBank(questionBankID);
    }

    async updateQuestion(id: string, userID: string, data: {
        content?: string;
        type?: QuestionType;
        difficulty?: DifficultyType;
        points?: number;
        correctAnswer?: string; 
        options?: { label: string; content: string }[];
    }) {
        const question = await this.questionRepository.findByID(id);
        if (!question) {
            throw new Error("Không tìm thấy câu hỏi!");
        }

        const bank = await this.questionBankRepository.findByID(question.questionBankID);
        if (!bank || bank.ownerID !== userID) {
            throw new Error("Bạn không có quyền sửa câu hỏi này!");
        }

        const updated = await this.questionRepository.updateQuestion(id, data);

        if (data.options) {
            await this.questionOptionRepository.deleteByQuestion(id);
            for (const option of data.options) {
                await this.questionOptionRepository.create({
                    questionID: id,
                    label: option.label,
                    content: option.content,
                });
            }
        }

        return this.questionRepository.findByID(id);
    }

    async deleteQuestion(id: string, userID: string) {
        const question = await this.questionRepository.findByID(id);
        if (!question) {
            throw new Error("Không tìm thấy câu hỏi!");
        }
        
        const questionBank = await this.questionBankRepository.findByID(question.questionBankID);
        if (!questionBank || questionBank.ownerID !== userID) {
            throw new Error("Bạn không có quyền xoá câu hỏi khỏi ngân hàng này!");
        }
        return this.questionRepository.deleteQuestion(id);
    }
}