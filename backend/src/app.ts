import router from './presentation/routes/index.js'
import express from 'express'
const app = express()

app.use('/api', router)

app.use(express.json())

export default app