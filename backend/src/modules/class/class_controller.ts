import type { FastifyReply } from "fastify";
import { ClassService } from "./class_service.js";
import type { AuthenticatedRequest } from "..//users/auth/auth_middleware.js";

export class ClassController {
    constructor(private classService: ClassService) {}

    async create(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const body = request.body as { name: string; description: string };

        const newClass = await this.classService.createClass({
            name: body.name,
            description: body.description,
            teacherID: userId,
        });

        return reply.status(201).send(newClass);
    }

    async list(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const classes = await this.classService.listMyClass(userId);
        return reply.send(classes);
    }

    async getByID(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const { id } = request.params as { id: string };

        const classData = await this.classService.getClassByID(id, userId);
        return reply.send(classData);
    }

    async joinByCode(request: AuthenticatedRequest, reply: FastifyReply) {
        const userId = request.user!.userId;
        const body = request.body as { joinCode: string };

        const classData = await this.classService.joinClassByCode(body.joinCode, userId);
        return reply.send(classData);
    }

    async addStudent(request: AuthenticatedRequest, reply: FastifyReply) {
        const teacherID = request.user!.userId;
        const { id: classID } = request.params as { id: string };
        const body = request.body as { email: string };

        const result = await this.classService.addStudent(classID, body.email, teacherID);
        return reply.send(result);
    }

    async removeStudent(request: AuthenticatedRequest, reply: FastifyReply) {
        const teacherID = request.user!.userId;
        const { id: classID, studentId } = request.params as { id: string; studentId: string };

        const result = await this.classService.removeStudent(classID, studentId, teacherID);
        return reply.send(result);
    }
}