import { prisma } from '../lib/prisma';
import { EmailService } from './email.service';
import { getIO } from '../lib/socket';
import logger from '../lib/logger';

export const NotificationService = {
  
  async create(userId: string, data: {
    type: string;
    title: string;
    message: string;
    link?: string;
  }) {
    // Save to database
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        read: false,
      }
    });

    // Send real-time via Socket.io
    try {
      const io = getIO();
      io.to(`user:${userId}`).emit('notification:new', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        createdAt: notification.createdAt,
      });
    } catch (error) {
      logger.warn('Socket.io notification failed', { userId, error });
    }

    // Send email for high priority types
    const highPriorityTypes = ['reward', 'governance', 'security'];
    if (highPriorityTypes.includes(data.type)) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true }
        });
        if (user) {
          await EmailService.sendNotification(
            user.email,
            user.name,
            data.title,
            data.message,
            data.link
          );
        }
      } catch (error) {
        logger.warn('Email notification failed', { userId, error });
      }
    }

    return notification;
  },

  async reward(userId: string, amount: number, agentName: string) {
    return NotificationService.create(userId, {
      type: 'reward',
      title: 'Staking Reward Received',
      message: `You earned ${amount.toFixed(4)} AGNT from ${agentName}`,
      link: '/dashboard/staking',
    });
  },

  async stakePlaced(agentOwnerId: string, stakerName: string, amount: number, agentName: string) {
    return NotificationService.create(agentOwnerId, {
      type: 'stake',
      title: 'New Stake on Your Agent',
      message: `${stakerName} staked ${amount} AGNT on ${agentName}`,
      link: '/dashboard/agents',
    });
  },

  async proposalResult(userId: string, title: string, passed: boolean) {
    return NotificationService.create(userId, {
      type: 'governance',
      title: `Proposal ${passed ? 'Passed' : 'Rejected'}`,
      message: `"${title}" has ${passed ? 'passed' : 'been rejected'}`,
      link: '/dashboard/governance',
    });
  },

  async invocationComplete(userId: string, agentName: string, success: boolean) {
    return NotificationService.create(userId, {
      type: 'invocation',
      title: `Agent ${success ? 'Completed' : 'Failed'}`,
      message: `${agentName} ${success ? 'completed successfully' : 'encountered an error'}`,
      link: '/dashboard/monitoring',
    });
  },

  async teamInvite(userId: string, teamName: string, inviterName: string) {
    return NotificationService.create(userId, {
      type: 'team',
      title: 'Team Invitation',
      message: `${inviterName} invited you to join ${teamName}`,
      link: '/dashboard/teams',
    });
  },
  
  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.update({
      where: { id: notificationId, userId },
      data: { read: true }
    });
  },

  async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }
};
