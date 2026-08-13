import type { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "./user_service.js";

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
}