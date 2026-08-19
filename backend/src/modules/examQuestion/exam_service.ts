import { ExamQuestionRepository } from "./examQuestion_repository.js";
import { ExamRepository } from "./exam_repository.js";
import { QuestionRepository } from "../question/question_repository.js";

export class ExamService {
    constructor(
        private examQuestionRepository: ExamQuestionRepository,
        private examRepository : ExamRepository,
        private questionRepository: QuestionRepository
    ) {};

    async createExam(data: {
        name: string,
        description: string,
        ownerID: string
    }) {
        return this.examRepository.createExam(data);
    }

    async getExamByID(id: string, userID: string) {
        const exam = await this.examRepository.findByID(id);
        if (!exam) {
            throw new Error("Không tìm thấy bài kiểm tra!");
        }
        if (exam.ownerID != userID) {
            throw new Error("Bạn không có quyền xem bài kiểm tra này!");
        }
        return exam;
    }

    async listExamByOwner(userID: string) {
        return this.examRepository.listByOwner(userID);
    }

    async updateExam(id: string, userID: string, data: {
        name: string,
        description: string
    }) {
        const exam = await this.examRepository.findByID(id);
        if (!exam) {
            throw new Error("Không tìm thấy bài kiểm tra!");
        }

        if (exam.ownerID != userID) {
            throw new Error("Bạn không có quyền chỉnh sửa bài kiểm tra này!");
        }
        return this.examRepository.updateExam(id, data);
    }

    async deleteExam(id: string, userID: string) {
        const exam = await this.examRepository.findByID(id);
        if (!exam) {
            throw new Error("Không tìm thấy bài kiểm tra!");
        }

        if (exam.ownerID != userID) {
            throw new Error("Bạn không có quyền xoá bài kiểm tra này!");
        }
        await this.examQuestionRepository.deleteExamQuestion(id);
        return this.examRepository.deleteExam(id);
    }

    // ExamQuestion methods
    async addQuestionToExam(userID: string, data: {
        examID: string,
        questionID: string,
        order: number,
        points: number
    }) {
        const exam = await this.examRepository.findByID(data.examID);
        if (!exam) {
            throw new Error("Không tìm thấy bài kiểm tra!");
        }
        if (exam.ownerID != userID) {
            throw new Error("Bạn không có quyền thêm câu hỏi vào bài kiểm tra này!");
        }

        const question = await this.examQuestionRepository.findByID(data.questionID);
        if (!question) {
            throw new Error("Không tìm thấy câu hỏi");
        }

        const existing = await this.examQuestionRepository.findByExamAndQuestion(
            data.examID,
            data.questionID,
        );
        if (existing) {
            throw new Error("Câu hỏi này đã có trong bài kiểm tra!");
        }
        return this.examQuestionRepository.createExamQuestion(data);
    }

    async updateExamQuestion(id: string, userID: string, data: {
        order: number;
        points: number;
    }) {
        const examQuestion = await this.examQuestionRepository.findByID(id);
        if (!examQuestion) {
            throw new Error("Không tìm thấy câu hỏi này trong bài kiểm tra!");
        }
        const exam = await this.examRepository.findByID(examQuestion.examID);
        if (!exam) {
            throw new Error("Không tìm thấy bài kiểm tra!");
        }
        if (exam.ownerID !== userID) {
            throw new Error("Bạn không có quyền sửa đề thi này!");
        }

        return this.examQuestionRepository.updateExamQuestion(id, data);
    }

    async deleteExamQuestion(id: string, userID: string) {
        const examQuestion = await this.examQuestionRepository.findByID(id);
        if (!examQuestion) {
            throw new Error("Không tìm thấy câu hỏi này trong bài kiểm tra!");
        }
        const exam = await this.examRepository.findByID(examQuestion.examID);
        if (!exam) {
            throw new Error("Không tìm thấy bài kiểm tra!");
        }
        if (exam.ownerID !== userID) {
            throw new Error("Bạn không có quyền xoá câu hỏi này trong đề thi!");
        }

        return this.examQuestionRepository.deleteExamQuestion(id);
    }
}
