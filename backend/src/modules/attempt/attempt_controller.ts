import type { FastifyReply } from "fastify";
import { AttemptService } from "./attempt_service.js";
import type { AuthenticatedRequest } from "../users/auth/auth_middleware.js";

export class AttemptController {
    constructor(private attemptService: AttemptService) {}

    async start(request: AuthenticatedRequest, reply: FastifyReply) {
        const studentID = request.user!.userId;
        const { id: assignmentID } = request.params as { id: string };

        const result = await this.attemptService.startAttempt(assignmentID, studentID);
        return reply.status(201).send(result);
    }

    async saveAnswer(request: AuthenticatedRequest, reply: FastifyReply) {
        const studentID = request.user!.userId;
        const { id: attemptID } = request.params as { id: string };
        const body = request.body as {
            examQuestionID: string;
            content: string;
        };

        const answer = await this.attemptService.saveAnswer(attemptID, studentID, body);
        return reply.send(answer);
    }

    async submit(request: AuthenticatedRequest, reply: FastifyReply) {
        const studentID = request.user!.userId;
        const { id: attemptID } = request.params as { id: string };

        const result = await this.attemptService.submitAttempt(attemptID, studentID);
        return reply.send(result);
    }

    async getResult(request: AuthenticatedRequest, reply: FastifyReply) {
        const studentID = request.user!.userId;
        const { id: attemptID } = request.params as { id: string };

        const result = await this.attemptService.getAttemptResult(attemptID, studentID);
        return reply.send(result);
    }
}