import dotenv from 'dotenv'
import { connectRedis } from './infrastructure/redis.js'

dotenv.config()


const { default : app } = await import("./app.js")
const { connectDB } = await import('./infrastructure/databases/connections.js')
await connectRedis()
await connectDB()

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})