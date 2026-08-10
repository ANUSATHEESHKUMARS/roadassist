import { authcontroller } from './di/container.js'
import createRoutes from './presentation/routes/index.js'
import express from 'express'
const app = express()

app.use(express.json())

app.use('/api', createRoutes(authcontroller))


export default app