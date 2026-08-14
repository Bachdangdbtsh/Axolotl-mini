import type { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "./user_service.js";
import type { AuthenticatedRequest } from "../users/auth/auth_middleware.js";

export class UserController {
    
    constructor(
        private userService : UserService
    ) {}

    async getUser(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        const { id } = request.params as { id: string };

        const user = await this.userService.getUserByID(id);

        return reply.send(user);
    }

    async getMe(
    request: AuthenticatedRequest,
    reply: FastifyReply
    ) {
        if (!request.user) {
            return reply.status(401).send({ error: "Chưa xác thực!" });
        }
        const user = await this.userService.getUserByID(request.user.userId);
        return reply.send(user);
    }
}