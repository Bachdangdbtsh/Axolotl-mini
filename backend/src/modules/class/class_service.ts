import { ClassRepository } from "../class/class_repository.js"
import { UserRepository } from "../users/user_repository.js"

// Ham generate joincode
function generateJoinCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export class ClassService {
    constructor(
        private classRepository: ClassRepository,
        private userRepository: UserRepository
    ) {};

    async createClass(data: {
        name: string,
        description: string,
        teacherID: string
    }) {
        const genJoinCode = generateJoinCode();

        // Tao class truoc, mac dich them TEACHER (addMember(teacherID))    
        const newClass = await this.classRepository.createClass({
            name: data.name,
            joinCode: genJoinCode,
            description: data.description
        });

        await this.classRepository.addMember({
            userID: data.teacherID,
            classID: newClass.id,
            role: "TEACHER"
        });

        return newClass;
    }

    // Tinh nang xem lop hoc (chi danh do nguoi co userID nhat dinh )
    async getClassByID(id: string, userID: string) {
        const classData = await this.classRepository.findByID(id);
        if (!classData) {
            throw new Error("Không tìm thấy lớp học!");
        }

        const isMember = classData.members.some((m) => m.userID === userID);
        if (!isMember) {
            throw new Error("Bạn không có quyền xem lớp học này!");
        }

        return classData;
    }

    async listMyClass(userID: string) {
        return this.classRepository.listByUser(userID);
    }

    async joinClassByCode(joinCode: string, studentID: string) {
        const classData = await this.classRepository.findByJoinCode(joinCode);
        if (!classData) {
            throw new Error("Mã lớp không hợp lệ!");
        }

        const existing = await this.classRepository.findMember(studentID, classData.id);
        if (existing) {
            throw new Error("Bạn đã tham gia lớp này rồi!");
        }

        await this.classRepository.addMember({
            userID: studentID,
            classID: classData.id,
            role: "STUDENT",
        });

        return classData;
    }

    async addStudent(classID: string, studentEmail: string, teacherID: string) {
        const classData = await this.classRepository.findByID(classID);
        if (!classData) {
            throw new Error("Không tìm thấy lớp học!");
        }
        
        const isTeacher = classData.members.some(
            (m) => m.userID === teacherID && m.role === "TEACHER"
        );
        if (!isTeacher) {
            throw new Error("Chỉ giáo viên mới có quyền thêm học sinh!");
        }

        const student = await this.userRepository.findByEmail(studentEmail);
        if (!student) {
            throw new Error("không tìm thấy học sinh!");
        }

        const isExisting = await this.classRepository.findMember(student.id, classID);
        if (isExisting) {
            throw new Error("Học sinh đã thuộc lớp học!");
        }

        await this.classRepository.addMember({
            userID: student.id,
            classID,
            role: "STUDENT",
        });

        return { message: "Đã thêm học sinh vào lớp!" };
    }

    async removeStudent(classID: string, studentID: string, teacherID: string) {
        const classData = await this.classRepository.findByID(classID);
        if (!classData) {
            throw new Error("Không tìm thấy lớp học!");
        }

        const isTeacher = classData.members.some(
            (m) => m.userID === teacherID && m.role === "TEACHER"
        );
        if (!isTeacher) {
            throw new Error("Chỉ giáo viên mới có quyền xóa học sinh!");
        }

        const existing = await this.classRepository.findMember(studentID, classID);
        if (!existing) {
            throw new Error("Học sinh này không có trong lớp!");
        }

        await this.classRepository.removeMember(studentID, classID);
        return { message: "Đã xóa học sinh khỏi lớp!" };
    }
}