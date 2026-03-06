import { Request, Response, NextFunction } from 'express';
import { createAuditLog } from '../services/auditService';

// List of actions that should be logged automatically
const AUTOLOG_ACTIONS = [
  { method: 'POST', path: '/api/auth/login', action: 'LOGIN' },
  { method: 'POST', path: '/api/auth/register', action: 'REGISTER' },
  { method: 'POST', path: '/api/agents', action: 'CREATE_AGENT' },
  { method: 'PUT', path: '/api/agents/:id', action: 'UPDATE_AGENT' },
  { method: 'DELETE', path: '/api/agents/:id', action: 'DELETE_AGENT' },
  { method: 'POST', path: '/api/staking/stake', action: 'STAKE' },
  { method: 'POST', path: '/api/staking/unstake/:stakeId', action: 'UNSTAKE' },
  { method: 'POST', path: '/api/staking/claim', action: 'CLAIM_REWARDS' },
  { method: 'POST', path: '/api/governance/proposals', action: 'CREATE_PROPOSAL' },
  { method: 'POST', path: '/api/governance/vote', action: 'VOTE' },
  { method: 'POST', path: '/api/teams', action: 'CREATE_TEAM' },
  { method: 'PUT', path: '/api/teams/:id', action: 'UPDATE_TEAM' },
  { method: 'DELETE', path: '/api/teams/:id', action: 'DELETE_TEAM' },
];

export function auditLogger(req: Request, res: Response, next: NextFunction) {
  // Store original res.json to intercept response
  const originalJson = res.json;
  // @ts-ignore
  res.json = function (body) {
    // Check if this request should be logged
    const match = AUTOLOG_ACTIONS.find(
      a => a.method === req.method && req.path.startsWith(a.path.replace(/:\w+/g, ''))
    );
    if (match && res.statusCode < 400) {
      // Successful action – log it
      const userId = (req as any).user?.id;
      createAuditLog({
        userId,
        action: match.action,
        entity: match.action.split('_')[1] || req.path.split('/')[2],
        entityId: req.params.id || body?.id,
        newData: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }).catch(console.error);
    }
    return originalJson.call(this, body);
  };
  next();
}
