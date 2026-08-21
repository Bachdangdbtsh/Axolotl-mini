import { AssignmentRepository } from "./assignment_repository.js";
import { AssignmentTargetRepository } from "./assignmentTarget_repository.js";
import { ExamRepository } from "../examQuestion/exam_repository.js";
import { classRole } from "../../generated/prisma/enums.js";
import { prisma } from "../../config/prisma.js";

export class AssignmentService {
    constructor(
        private assignmentRepository: AssignmentRepository,
        private assignmentTargetRepository: AssignmentTargetRepository,
        private examRepository: ExamRepository,
    ) {}

    async createAssignment(teacherID: string, data: {
        examID: string;
        name: string;
        startTime?: Date;
        deadline?: Date;
        duration?: number;
        maxAttempts?: number;
        showResult?: boolean;
        showCorrectAnswer?: boolean;
        shuffleQuestions?: boolean;
        shuffleOptions?: boolean;
    }) {
        const exam = await this.examRepository.findByID(data.examID);
        if (!exam) {
            throw new Error("Không tìm thấy đề thi!");
        }
        if (exam.ownerID !== teacherID) {
            throw new Error("Bạn không có quyền tạo bài giao từ đề thi này!");
        }

        return this.assignmentRepository.createAssignment({
            examID: data.examID,
            name: data.name,
            ...(data.startTime !== undefined && { startTime: data.startTime }),
            ...(data.deadline !== undefined && { deadline: data.deadline }),
            ...(data.duration !== undefined && { duration: data.duration }),
            maxAttempts: data.maxAttempts ?? 1,
            showResult: data.showResult ?? true,
            showCorrectAnswer: data.showCorrectAnswer ?? false,
            shuffleQuestions: data.shuffleQuestions ?? false,
            shuffleOptions: data.shuffleOptions ?? false,
        });
    }

    async getAssignmentByID(id: string, userID: string, userRole: classRole) {
        const assignment = await this.assignmentRepository.findByID(id);
        if (!assignment) {
            throw new Error("Không tìm thấy lần giao bài nào!");
        }

        if (userRole === classRole.TEACHER) {
            if (assignment.exam.ownerID !== userID) {
                throw new Error("Bạn không có quyền xem bài giao này!");
            }
            return assignment;
        }

        if (userRole === classRole.STUDENT) {
            const isTargeted = await this.isStudentTargeted(assignment.id, userID);
            if (!isTargeted) {
                throw new Error("Bạn không được giao bài này!");
            }

            if (assignment.startTime && new Date() < assignment.startTime) {
                throw new Error("Bài giao chưa được giao!");
            }
            if (assignment.deadline && new Date() > assignment.deadline) {
                throw new Error("Bài giao đã quá hạn!");
            }
            return assignment;
        }
        throw new Error("Vai trò không hợp lệ!");
    }

    async listAssignments(userID: string, userRole: classRole) {
        if (userRole === classRole.TEACHER) {
            return this.assignmentRepository.listByTeacher(userID);
        }
        if (userRole === classRole.STUDENT) {
            return this.assignmentRepository.listByStudent(userID);
        }
        throw new Error("Vai trò không hợp lệ!");
    }

    async updateAssignment(id: string, userID: string, data: {
        name?: string;
        startTime?: Date;
        deadline?: Date;           
        duration?: number;
        maxAttempts?: number;      
        showResult?: boolean;
        showCorrectAnswer?: boolean;  
        shuffleQuestions?: boolean;
        shuffleOptions?: boolean;
        status?: "BAN_NHAP" | "CHINH_THUC" | "DA_DONG";
    }) {
        const assignment = await this.assignmentRepository.findByID(id);
        if (!assignment) {
            throw new Error("Không tìm thấy bài giao!");
        }
        if (assignment.exam.ownerID !== userID) {
            throw new Error("Bạn không có quyền chỉnh sửa bài giao này!");
        }
        return this.assignmentRepository.updateAssignment(id, data);
    }

    async deleteAssignment(id: string, userID: string) {
        const assignment = await this.assignmentRepository.findByID(id);
        if (!assignment) {
            throw new Error("Không tìm thấy bài giao!");
        }
        if (assignment.exam.ownerID !== userID) {
            throw new Error("Bạn không có quyền xóa bài giao này!");
        }
        // Xóa targets trước
        await this.assignmentTargetRepository.deleteByAssignment(id);
        return this.assignmentRepository.deleteAssignment(id);
    }

    // AssignmentTarget
    async addTarget(teacherID: string, data: {
        assignmentID: string;
        targetType: "CLASS" | "USER";
        classID?: string;
        userID?: string;
    }) {
        const assignment = await this.assignmentRepository.findByID(data.assignmentID);
        if (!assignment) {
            throw new Error("Không tìm thấy bài giao!");
        }
        if (assignment.exam.ownerID !== teacherID) {
            throw new Error("Bạn không có quyền thêm đối tượng vào bài giao này!");
        }

        if (data.targetType === "CLASS" && !data.classID) {
            throw new Error("Cần cung cấp classID khi giao cho lớp!");
        }
        if (data.targetType === "USER" && !data.userID) {
            throw new Error("Cần cung cấp userID khi giao cho học sinh!");
        }

        return this.assignmentTargetRepository.createAssignmentTarget(data);
    }

    async deleteAssignmentTarget(teacherID: string, targetID: string) {
        const target = await this.assignmentTargetRepository.findByID(targetID);
        if (!target) {
            throw new Error("Không tìm thấy đối tượng giao bài!");
        }

        const assignment = await this.assignmentRepository.findByID(target.assignmentID);
        if (!assignment || assignment.exam.ownerID !== teacherID) {
            throw new Error("Bạn không có quyền xóa đối tượng này!");
        }

        return this.assignmentTargetRepository.deleteAssignmentTarget(targetID);
    }

    // Helper
    private async isStudentTargeted(assignmentID: string, studentID: string): Promise<boolean> {
        const targets = await this.assignmentTargetRepository.listByAssignment(assignmentID);
        if (!targets || targets.length === 0) {
            return false;
        }

        for (const target of targets) {
            if (target.targetType === "USER" && target.userID === studentID) {
                return true;
            }
            if (target.targetType === "CLASS" && target.classID) {
                const isMember = await prisma.classMember.findFirst({
                    where: {
                        userID: studentID,
                        classID: target.classID,
                    },
                });
                if (isMember) return true;
            }
        }
        return false;
    }
}