import type { FastifyInstance } from "fastify";
import { ClassController } from "./class_controller.js";
import { ClassService } from "./class_service.js";
import { ClassRepository } from "./class_repository.js";
import { UserRepository } from "../users/user_repository.js";
import { authMiddleware } from "../users/auth/auth_middleware.js";

export async function classRoutes(app: FastifyInstance) {
    const classRepository = new ClassRepository();
    const userRepository = new UserRepository();
    const classService = new ClassService(classRepository, userRepository);
    const classController = new ClassController(classService);

    // Tạo lớp (teacher only)
    app.post("/", { preHandler: [authMiddleware] }, async (request, reply) => {
        return classController.create(request, reply);
    });

    // Danh sách lớp của user đang đăng nhập
    app.get("/", { preHandler: [authMiddleware] }, async (request, reply) => {
        return classController.list(request, reply);
    });

    // Chi tiết lớp
    app.get("/:id", { preHandler: [authMiddleware] }, async (request, reply) => {
        return classController.getByID(request, reply);
    });

    // Học sinh vào lớp bằng joinCode
    app.post("/join", { preHandler: [authMiddleware] }, async (request, reply) => {
        return classController.joinByCode(request, reply);
    });

    // Giáo viên thêm học sinh vào lớp
    app.post("/:id/members", { preHandler: [authMiddleware] }, async (request, reply) => {
        return classController.addStudent(request, reply);
    });

    // Giáo viên xóa học sinh khỏi lớp
    app.delete("/:id/members/:studentId", { preHandler: [authMiddleware] }, async (request, reply) => {
        return classController.removeStudent(request, reply);
    });
}
