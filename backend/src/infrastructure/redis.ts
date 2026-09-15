import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL!
});

redisClient.on("error", (error) => {
    console.error("Redis Client Error:", error);
});

export const connectRedis = async (): Promise<void> => {
    await redisClient.connect();

    console.log("Redis connected successfully");
};

export default redisClient;