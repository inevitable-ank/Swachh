import { redis } from "./redis";

export async function issueRateLimited(userId: string, max = 2, hours = 24) {
  const key = `issue_limit:${userId}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, hours * 3600);
  }

  return count > max;
}
