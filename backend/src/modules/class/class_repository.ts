import {prisma } from "../../config/prisma.js"

export class ClassRepository {
    async findByID(id: string) {
        return prisma.class.findUnique({
            where: { id },
            include: { 
                members: { 
                    include: { user: true } 
                } 
            },
        });
    }

    async findByJoinCode(joinCode: string) {
        return prisma.class.findUnique({
            where: {joinCode}
        });
    }
    
    async listByUser(userID: string) {
        return prisma.class.findMany({
            where: {
                members: {
                    some: {userID},
                },
            },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
            },
        });
    }

    async createClass(data: { name: string, joinCode: string, description: string }) {
        return prisma.class.create({ data });
    } 

    async addMember(data: {userID: string, classID: string, role: "TEACHER" | "STUDENT"}) {
        return prisma.classMember.create({data});
    }

    async findMember(userID: string, classID: string) {
        return prisma.classMember.findUnique({
                where: {
                    userID_classID: {
                        userID,
                        classID
                    }
                }
            }
        )
    }

    async removeMember(userID: string, classID: string) {
        return prisma.classMember.deleteMany({
            where: {
                userID,
                classID
            }
        })
    }
}