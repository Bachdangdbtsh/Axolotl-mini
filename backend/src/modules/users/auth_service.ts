import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../users/user_repository.js";
import { env } from "../../config/env.js";

export class AuthService {
    constructor(private userRepository: UserRepository) {}

    async register(data: {
        email: string;
        password: string;
        name: string;
        role: "TEACHER" | "STUDENT";
    }) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error("Email không hợp lệ!");
        }

        // Validate password length
        if (data.password.length < 6) {
            throw new Error("Mật khẩu phải có ít nhất 6 ký tự!");
        }

        // Check email exists
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error("Email đã được sử dụng!");
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 12);

        // Create user
        const user = await this.userRepository.createRepository({
            name: data.name,
            email: data.email,
            passwordHash,
            role: data.role,
        });

        // Generate JWT
        const token = this.generateToken(user.id);

        return {
            accessToken: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }

    async login(data: { email: string; password: string }) {
        // Find user
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error("Email hoặc mật khẩu không đúng!");
        }

        // Verify password
        const isValid = await bcrypt.compare(data.password, user.passwordHash);
        if (!isValid) {
            throw new Error("Email hoặc mật khẩu không đúng!");
        }

        // Generate JWT
        const token = this.generateToken(user.id);

        return {
            accessToken: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }

    private generateToken(userId: string): string {
        if (!env.jwtSecret) {
            throw new Error("JWT_SECRET không được cấu hình!");
        }
        return jwt.sign({ userId }, env.jwtSecret, { expiresIn: "7d" });
    }
}
