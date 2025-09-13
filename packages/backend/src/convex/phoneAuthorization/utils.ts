// Rate limiting configuration
const RATE_LIMITS = {
    PHONE_INVITATIONS: {
        maxAttempts: 15,
        windowMs: 60 * 60 * 1000, // 1 hour
    },
};

// Helper function to check rate limits based on existing data
export function checkRateLimit(
    recentActions: { createdAt: number }[],
    limitType: keyof typeof RATE_LIMITS
): boolean {
    const limit = RATE_LIMITS[limitType];
    const cutoffTime = Date.now() - limit.windowMs;

    const recentCount = recentActions.filter(
        action => action.createdAt > cutoffTime
    ).length;

    return recentCount < limit.maxAttempts;
}

// Get rate limit info for error messages
export function getRateLimitInfo(limitType: keyof typeof RATE_LIMITS) {
    const limit = RATE_LIMITS[limitType];
    return {
        maxAttempts: limit.maxAttempts,
        windowMinutes: Math.floor(limit.windowMs / (60 * 1000)),
    };
}
