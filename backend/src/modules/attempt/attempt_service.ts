import { AttemptRepository } from "./attempt_repository.js";
import { AnswerRepository } from "./answer_repository.js";
import { ResultRepository } from "./result_repository.js";
import { AssignmentRepository } from "../assignment/assignment_repository.js";
import { ExamQuestionRepository } from "../examQuestion/examQuestion_repository.js";
import { AttemptStatus } from "../../generated/prisma/enums.js";

export class AttemptService {
    constructor(
        private attemptRepository: AttemptRepository,
        private answerRepository: AnswerRepository,
        private resultRepository: ResultRepository,
        private assignmentRepository: AssignmentRepository,
        private examQuestionRepository: ExamQuestionRepository
    ) {};

    async startAttempt(assignmentID: string, studentID: string) {
        const assignment = await this.assignmentRepository.findByID(assignmentID);
        if (!assignment) {
            throw new Error("Không tìm thấy bài giao!");
        }

        // Kiểm tra thời gian
        if (assignment.startTime && new Date() < assignment.startTime) {
            throw new Error("Bài giao chưa bắt đầu!");
        }
        if (assignment.deadline && new Date() > assignment.deadline) {
            throw new Error("Bài giao đã hết hạn!");
        }

        const attemptCount = await this.attemptRepository.countByAssignmentAndStudent(assignmentID, studentID);
        if (attemptCount >= assignment.maxAttempts) {
            throw new Error("Không được phép làm lại nhiều lần!");
        }

        const attempt = await this.attemptRepository.createAttempt({assignmentID, studentID});


        const examQuestions = assignment.exam.examQuestions;
        let questions = [...examQuestions];

        if (assignment.shuffleQuestions) {
            questions = this.shuffleArray(questions);
        }


        return {
            attemptID: attempt.id,
            startedAt: attempt.startedAt,
            duration: assignment.duration,
            questions: questions.map((eq) => ({
                examQuestionID: eq.id,
                order: eq.order,
                points: eq.points,
                question: {
                    content: eq.question.content,
                    type: eq.question.type,
                    options: assignment.shuffleOptions
                        ? this.shuffleArray(eq.question.options)
                        : eq.question.options,
                },
            })),
        };
    }

    async saveAnswer(attemptID: string, studentID: string, data: {
        examQuestionID: string;
        content: string;
    }) {
        const attempt = await this.attemptRepository.findByID(attemptID);
        if (!attempt || attempt.studentID !== studentID) {
            throw new Error("Không tìm thấy lượt làm bài!");
        }
        if (attempt.status !== AttemptStatus.DANG_THUC_HIEN) {
            throw new Error("Lượt làm bài đã kết thúc!")
        }

        const assignment = await this.assignmentRepository.findByID(attempt.assignmentID);
        if (assignment?.duration) {
            const elapsed = (new Date().getTime() - attempt.startedAt.getTime()) / 1000 / 60;
            if (elapsed > assignment.duration) {
                await this.attemptRepository.updateStatus(attemptID, AttemptStatus.HET_HAN);
                throw new Error("Đã hết thời gian làm bài!");
            }
        }

        return this.answerRepository.createOrUpdate({
            attemptID,
            examQuestionID: data.examQuestionID,
            content: data.content
        });
    }

    async submitAttempt(attemptID: string, studentID: string) {
        // Kiểm tra attempt
        const attempt = await this.attemptRepository.findByID(attemptID);
        if (!attempt || attempt.studentID !== studentID) {
            throw new Error("Không tìm thấy lượt làm bài!");
        }
        if (attempt.status !== "DANG_THUC_HIEN") {
            throw new Error("Lượt làm bài đã kết thúc!");
        }

        // Cập nhật status
        await this.attemptRepository.updateStatus(attemptID, "DA_NOP_BAI");

        // Chấm điểm tự động
        const result = await this.gradeAttempt(attemptID);

        return result;
    }

    async getAttemptResult(attemptID: string, studentID: string) {
        const attempt = await this.attemptRepository.findByID(attemptID);
        if (!attempt || attempt.studentID !== studentID) {
            throw new Error("Không tìm thấy lượt làm bài!");
        }

        const assignment = await this.assignmentRepository.findByID(attempt.assignmentID);
        
        // Kiểm tra xem có được xem đáp án không
        const showCorrectAnswer = assignment?.showCorrectAnswer ?? false;

        const result = await this.resultRepository.findByAttempt(attemptID);
        if (!result) {
            throw new Error("Chưa có kết quả!");
        }

        const answers = await this.answerRepository.listByAttempt(attemptID);

        const answerDetails = await Promise.all(answers.map(async (a) => {
            const examQuestion = await this.examQuestionRepository.findByID(a.examQuestion.id);
            return {
                questionContent: examQuestion?.question.content ?? "",
                studentAnswer: a.content,
                correctAnswer: showCorrectAnswer ? examQuestion?.question.correctAnswer ?? null : null,
                points: a.examQuestion.points,
            };
        }));

        return {
            score: result.score,
            totalPoints: result.totalPoints,
            percentage: result.percentage,
            answers: answerDetails,
        };
    }
    // helper functions


    private async gradeAttempt(attemptID: string) {
        const attempt = await this.attemptRepository.findByID(attemptID);
        if (!attempt) throw new Error("Không tìm thấy lượt làm bài!");

        const answers = await this.answerRepository.listByAttempt(attemptID);
        let score = 0;
        let totalPoints = 0;

        for (const answer of answers) {
            const eq = answer.examQuestion;
            const examQuestion = await this.examQuestionRepository.findByID(eq.id);
            if (!examQuestion) continue;
            totalPoints += eq.points;

            // Chấm tự động TRAC_NGHIEM và DUNG_SAI
            if (examQuestion.question.type === "TRAC_NGHIEM" || examQuestion.question.type === "DUNG_SAI") {
                if (answer.content.trim().toUpperCase() === examQuestion.question.correctAnswer.trim().toUpperCase()) {
                    score += eq.points;
                }
            }
            // TU_LUAN: không chấm tự động, để teacher chấm sau
        }

        const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

        return this.resultRepository.createResult({
            attemptID,
            score,
            totalPoints,
            percentage: Math.round(percentage * 100) / 100,
        });
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
        }
        return shuffled;
    }
}