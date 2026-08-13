// file repository nay cho biet cach lay du lieu User tu database

import { prisma } from "../../config/prisma.js";
import type { classRole } from "../../generated/prisma/enums.js";

// Tra ve 1 class chua thong tin User
export class UserRepository {
    async findByID(id: string) {
        return prisma.user.findUnique({
            where: {id}
        });
    }

    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: {email}
        });
    }

    async createRepository(data: {
        name: string,
        email: string,
        passwordHashed: string,
        role: "TEACHER" | "STUDENT",
    }) {
        return prisma.user.create({data});
    }
}
