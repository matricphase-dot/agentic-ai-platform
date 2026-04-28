import { prisma } from "../lib/prisma";
import { TeamRole } from "@prisma/client";
import crypto from "crypto";

export class TeamService {
  static async createTeam(ownerId: string, name: string, description?: string) {
    const slug = name.toLowerCase().replace(/ /g, '-');
    return prisma.team.create({
      data: {
        name,
        slug,
        description,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: TeamRole.OWNER
          }
        }
      }
    });
  }

  static async getTeams(userId: string) {
    return prisma.team.findMany({
      where: {
        members: { some: { userId } }
      },
      include: {
        _count: { select: { members: true, agents: true } }
      }
    });
  }

  static async inviteMember(teamId: string, inviterId: string, email: string, role: TeamRole = TeamRole.MEMBER) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.ownerId !== inviterId) throw new Error("Unauthorized");

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return prisma.teamInvite.create({
      data: {
        teamId,
        inviterId,
        email,
        token,
        role,
        expiresAt
      }
    });
  }

  static async getTeam(teamId: string, userId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
        agents: true
      }
    });
    if (!team || !team.members.find(m => m.userId === userId)) throw new Error("Not found");
    return team;
  }

  static async updateTeam(teamId: string, userId: string, data: { name?: string, description?: string }) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.ownerId !== userId) throw new Error("Unauthorized");
    return prisma.team.update({
      where: { id: teamId },
      data
    });
  }

  static async deleteTeam(teamId: string, userId: string) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.ownerId !== userId) throw new Error("Unauthorized");
    return prisma.team.delete({ where: { id: teamId } });
  }

  static async changeMemberRole(teamId: string, ownerId: string, memberId: string, role: TeamRole) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.ownerId !== ownerId) throw new Error("Unauthorized");
    return prisma.teamMember.update({
      where: { teamId_userId: { teamId, userId: memberId } },
      data: { role }
    });
  }

  static async removeMember(teamId: string, ownerId: string, memberId: string) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.ownerId !== ownerId) throw new Error("Unauthorized");
    return prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId: memberId } }
    });
  }

  static async getTeamAgents(teamId: string, userId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true, agents: true }
    });
    if (!team || !team.members.find(m => m.userId === userId)) throw new Error("Not found");
    return team.agents;
  }
}
