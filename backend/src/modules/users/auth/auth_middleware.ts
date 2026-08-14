import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../../../config/env.js";

export interface AuthenticatedRequest extends FastifyRequest {
    user?: {
        userId: string;
    };
}

export async function authMiddleware(
    request: AuthenticatedRequest,
    reply: FastifyReply
) {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "Không có token xác thực!" });
    }

    const token = authHeader.slice(7);

    try {
        if (!env.jwtSecret) {
            throw new Error("JWT_SECRET không được cấu hình!");
        }

        const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
        request.user = { userId: decoded.userId };
    } catch (error) {
        return reply.status(401).send({ error: "Token không hợp lệ hoặc đã hết hạn!" });
    }
}