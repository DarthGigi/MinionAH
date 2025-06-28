import type { Session, User } from "$generated/prisma";
import prisma from "$lib/server/prisma";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";

/**
 * Generate a secure session token with increased entropy
 */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(32); // Increased from 20 to 32 for better security
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

/**
 * Create a new session for a user
 */
export async function createSession(token: string, userId: string): Promise<Session> {
  if (!token || !userId) {
    throw new Error('Token and userId are required');
  }

  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
  };
  
  try {
    await prisma.session.create({
      data: session
    });
    return session;
  } catch (error) {
    console.error('Failed to create session:', error);
    throw new Error('Failed to create session');
  }
}

/**
 * Validate a session token and return session/user data
 */
export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  if (!token) {
    return { session: null, user: null };
  }

  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  
  try {
    const result = await prisma.session.findUnique({
      where: {
        id: sessionId
      },
      include: {
        user: {
          include: {
            _count: {
              select: {
                chatsAsUser1: {
                  where: {
                    user1Read: false
                  }
                },
                chatsAsUser2: {
                  where: {
                    user2Read: false
                  }
                },
                key: {
                  where: {
                    id: {
                      startsWith: "username:"
                    },
                    hashed_password: {
                      equals: null
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (result === null) {
      return { session: null, user: null };
    }

    const { user, ...session } = result;

    // Check if session has expired
    if (Date.now() >= session.expiresAt.getTime()) {
      await prisma.session.delete({ where: { id: sessionId } });
      return { session: null, user: null };
    }

    const prismaPromises: Promise<unknown>[] = [];

    // Extend session if it's close to expiring (within 15 days)
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
      session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      prismaPromises.push(
        prisma.session.update({
          where: {
            id: session.id
          },
          data: {
            expiresAt: session.expiresAt
          }
        })
      );
    }

    // Update last login time if more than an hour has passed
    const timeDifference = new Date().getTime() - user.loggedInAt.getTime();
    if (timeDifference > 3600000) {
      prismaPromises.push(
        prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            loggedInAt: new Date()
          }
        })
      );
    }

    if (prismaPromises.length > 0) {
      await Promise.all(prismaPromises);
    }

    return { session, user };
  } catch (error) {
    console.error('Session validation error:', error);
    return { session: null, user: null };
  }
}

/**
 * Invalidate a specific session
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }

  try {
    await prisma.session.delete({
      where: {
        id: sessionId
      }
    });
  } catch (error) {
    console.error('Failed to invalidate session:', error);
    throw new Error('Failed to invalidate session');
  }
}

/**
 * Invalidate all sessions for a specific user
 */
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    await prisma.session.deleteMany({
      where: {
        userId
      }
    });
  } catch (error) {
    console.error('Failed to invalidate user sessions:', error);
    throw new Error('Failed to invalidate user sessions');
  }
}

/**
 * Get active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    return await prisma.session.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        expiresAt: 'desc'
      }
    });
  } catch (error) {
    console.error('Failed to get user sessions:', error);
    throw new Error('Failed to get user sessions');
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
    throw new Error('Failed to cleanup expired sessions');
  }
}

/**
 * Check if a session is valid without updating it
 */
export async function isSessionValid(sessionId: string): Promise<boolean> {
  if (!sessionId) {
    return false;
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    return session !== null && Date.now() < session.expiresAt.getTime();
  } catch (error) {
    console.error('Session validation check error:', error);
    return false;
  }
}

export type SessionValidationResult =
  | {
      session: Session;
      user: User & {
        _count: {
          chatsAsUser1: number;
          chatsAsUser2: number;
          key: number;
        };
      };
    }
  | { session: null; user: null };
