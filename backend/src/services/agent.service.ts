import { prisma } from "../lib/prisma";
import { encryptionService } from "./encryption.service";
import logger from "../lib/logger";
import { AgentCategory, AgentStatus, PricingModel } from "@prisma/client";

export class AgentService {
  static async listAgents(filters: { userId?: string; category?: string; status?: string; isPublic?: boolean }) {
    return prisma.agent.findMany({
      where: {
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.category && { category: filters.category as AgentCategory }),
        ...(filters.status && { status: filters.status as AgentStatus }),
        ...(filters.isPublic !== undefined && { isPublic: filters.isPublic }),
      },
      include: {
        analytics: true,
        user: {
          select: {
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async createAgent(userId: string, data: any) {
    const { 
      name, 
      slug, 
      description, 
      modelProvider, 
      modelName, 
      systemPrompt, 
      category, 
      pricingModel, 
      pricePerCall, 
      pricePerToken,
      isPublic,
      inputSchema,
      outputSchema,
      cpuRequired,
      ramRequired,
      gpuRequired,
      tags
    } = data;

    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.agent.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return prisma.agent.create({
      data: {
        userId,
        name,
        slug: uniqueSlug,
        description,
        modelProvider,
        modelName,
        systemPrompt,
        category: category as AgentCategory,
        pricingModel: pricingModel as PricingModel,
        pricePerCall: pricePerCall || 0,
        pricePerToken: pricePerToken || 0,
        isPublic: isPublic ?? true,
        inputSchema: inputSchema || {},
        outputSchema: outputSchema || {},
        cpuRequired: cpuRequired || 1,
        ramRequired: ramRequired || 512,
        gpuRequired: gpuRequired || false,
        tags: tags || [],
        status: AgentStatus.DRAFT, // Start as draft
        analytics: {
          create: {}
        }
      }
    });
  }

  static async getAgentById(id: string) {
    return prisma.agent.findUnique({
      where: { id },
      include: {
        analytics: true,
        versions: true,
        user: {
          select: {
            name: true,
            avatar: true
          }
        }
      }
    });
  }

  static async updateAgent(id: string, userId: string, data: any) {
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent || agent.userId !== userId) {
      throw new Error("Agent not found or unauthorized.");
    }

    return prisma.agent.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  static async deleteAgent(id: string, userId: string) {
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent || agent.userId !== userId) throw new Error("Unauthorized");
    return prisma.agent.delete({ where: { id } });
  }

  static async publish(id: string, userId: string) {
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent || agent.userId !== userId) throw new Error("Unauthorized");
    return prisma.agent.update({
      where: { id },
      data: { status: AgentStatus.PUBLISHED, isPublic: true }
    });
  }

  static async getAnalytics(id: string) {
    const analytics = await prisma.agentAnalytics.findUnique({ where: { agentId: id } });
    if (!analytics) throw new Error("Not found");
    return analytics;
  }

  static async createVersion(id: string, userId: string, data: any) {
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent || agent.userId !== userId) throw new Error("Unauthorized");
    
    // Update current version string on agent
    await prisma.agent.update({ where: { id }, data: { currentVersion: data.version } });

    return prisma.agentVersion.create({
      data: {
        agentId: id,
        version: data.version,
        systemPrompt: data.systemPrompt || agent.systemPrompt,
        modelProvider: data.modelProvider || agent.modelProvider,
        modelName: data.modelName || agent.modelName,
        config: data.config || {},
        changelog: data.changelog,
        isActive: true
      }
    });
  }

  static async getVersions(id: string) {
    return prisma.agentVersion.findMany({
      where: { agentId: id },
      orderBy: { createdAt: "desc" }
    });
  }

  static async rollback(id: string, userId: string, versionId: string) {
    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent || agent.userId !== userId) throw new Error("Unauthorized");
    
    const version = await prisma.agentVersion.findUnique({ where: { id: versionId } });
    if (!version || version.agentId !== id) throw new Error("Version not found");

    return prisma.agent.update({
      where: { id },
      data: {
        currentVersion: version.version,
        systemPrompt: version.systemPrompt,
        modelProvider: version.modelProvider,
        modelName: version.modelName
      }
    });
  }
}
