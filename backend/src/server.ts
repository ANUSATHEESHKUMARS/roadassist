
import dotenv from 'dotenv';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

import { connectRedis } from './infrastructure/redis.js';
import { socketAuthMiddleware } from './presentation/middlewares/SocketAuthMiddleware.js';

dotenv.config();

const {
    createEmergencyDependencies,
    tokenService,
    userRepository
} = await import('./di/container.js');

const { connectDB } =
    await import('./infrastructure/databases/connections.js');

await connectRedis();
await connectDB();

const io = new Server({
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
});

io.use(socketAuthMiddleware(tokenService, userRepository));

io.on('connection', (socket) => {
    const mechanicId = socket.data.userId;

    socket.join(`mechanic:${mechanicId}`);

    console.log('Mechanic connected:', mechanicId);
    console.log('Joined room:', `mechanic:${mechanicId}`);

    socket.on('disconnect', () => {
        console.log('Mechanic disconnected:', mechanicId);
    });
});

const { createEmergencyRequestController } =
    createEmergencyDependencies(io);

const { createApp } = await import('./app.js');

const app = createApp(createEmergencyRequestController);

const httpServer = createServer(app);

io.attach(httpServer);

const port = Number(process.env.PORT) || 3000;

httpServer.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
