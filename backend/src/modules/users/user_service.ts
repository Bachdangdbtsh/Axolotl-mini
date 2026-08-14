// Day la file quy dinh logic xu ly cho User

import { UserRepository } from "./user_repository.js";

export class UserService {
    constructor(
        private userRepository : UserRepository
    ) {};
    
    async createUser(data: {
        name: string,
        email: string,
        passwordHash: string,
        role: "TEACHER" | "STUDENT"
    }) {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error("Tài khoản người dùng đã tồn tại!");
        }
        return this.userRepository.createRepository(data);
    }

    async getUserByID(id: string) {
        const user = await this.userRepository.findByID(id);

        if (!user) {
            throw new Error(`Không tìm thấy người dùng ID: ${id}`)
        }
        return user;
    }
}