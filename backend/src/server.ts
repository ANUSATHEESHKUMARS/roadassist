import app from './app.js'
import dotenv from 'dotenv'
import { connectDB } from './infrastructure/databases/connections.js'

dotenv.config()

await connectDB()

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})