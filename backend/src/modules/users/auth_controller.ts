import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth_service.js";

export class AuthController {
    constructor(private authService: AuthService) {}

    async register(
        request: FastifyRequest<{
            Body: {
                email: string;
                password: string;
                name: string;
                role: "TEACHER" | "STUDENT";
            };
        }>,
        reply: FastifyReply
    ) {
        const { email, password, name, role } = request.body;

        const result = await this.authService.register({
            email,
            password,
            name,
            role,
        });

        return reply.status(201).send(result);
    }

    async login(
        request: FastifyRequest<{
            Body: {
                email: string;
                password: string;
            };
        }>,
        reply: FastifyReply
    ) {
        const { email, password } = request.body;

        const result = await this.authService.login({ email, password });

        return reply.send(result);
    }
}
