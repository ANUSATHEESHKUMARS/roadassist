
import "dotenv/config"
import { createServer } from 'node:http';
import { Server } from 'socket.io';

import { connectRedis } from './infrastructure/redis.js';
import { socketAuthMiddleware } from './presentation/middlewares/SocketAuthMiddleware.js';
import { MechanicLocationSocketHandler } from './presentation/socket/MechanicLocationSocketHandler.js';
import { CustomerTrackingSocketHandler } from './presentation/socket/CustomerTrackingSocketHandler.js';
import { mechanicLocationStore } from './di/container.js';


const {
    createEmergencyDependencies,
    tokenService,
    userRepository,
    updateMechanicLiveLocationUseCase,
    joinEmergencyTrackingUseCase
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

const mechanicLocationSocketHandler =
    new MechanicLocationSocketHandler(
        io,
        updateMechanicLiveLocationUseCase
    );

const customerTrackingSocketHandler = new CustomerTrackingSocketHandler(joinEmergencyTrackingUseCase, mechanicLocationStore)

io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const activeRole = socket.data.activeRole;

    if (activeRole === "mechanic") {
        socket.join(`mechanic:${userId}`);
        socket.join("mechanics:online");

        console.log("Mechanic connected:", userId);

        mechanicLocationSocketHandler.register(socket);
        emergencyCallSocketHandler.register(socket);
    }

    if (activeRole === "user") {
        socket.join(`user:${userId}`);
        console.log("Customer connected:", userId);
        customerTrackingSocketHandler.register(socket);
        emergencyCallSocketHandler.register(socket);
    }

    socket.on("disconnect", () => {
        console.log(`${activeRole} disconnected:`, userId);
    });
});
const { createEmergencyRequestController, emergencyCallSocketHandler } =
    createEmergencyDependencies(io);

const { createApp } = await import('./app.js');

const app = createApp(createEmergencyRequestController);

const httpServer = createServer(app);

io.attach(httpServer);

const port = Number(process.env.PORT) || 3000;

httpServer.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
