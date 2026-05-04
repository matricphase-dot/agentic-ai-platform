/**
 * Sanitizes user objects by removing sensitive fields.
 */
export function sanitizeUser(user: any) {
  if (!user) return null;
  const { 
    passwordHash, 
    twoFactorSecret, 
    emailVerifyToken, 
    passwordResetToken, 
    passwordResetExpiry, 
    ...safe 
  } = user;
  return safe;
}

/**
 * Sanitizes node objects by masking the API key.
 */
export function sanitizeNode(node: any) {
  if (!node) return null;
  const { nodeApiKey, ...safe } = node;
  return {
    ...safe,
    nodeApiKey: nodeApiKey ? `${nodeApiKey.substring(0, 8)}...` : undefined
  };
}
