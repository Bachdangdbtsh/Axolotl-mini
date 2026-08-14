import type { FastifyInstance } from "fastify";
import { AuthController } from "./auth_controller.js";
import { AuthService } from "./auth_service.js";
import { UserRepository } from "../users/user_repository.js";

export async function authRoutes(app: FastifyInstance) {
    const userRepository = new UserRepository();
    const authService = new AuthService(userRepository);
    const authController = new AuthController(authService);

    app.post<{ Body: { email: string; password: string; name: string; role: "TEACHER" | "STUDENT"; } }>("/register", async (request, reply) => {
        return authController.register(request, reply);
    });

    app.post<{ Body: { email: string; password: string } }>("/login", async (request, reply) => {
        return authController.login(request, reply);
    });
}
