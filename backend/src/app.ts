import { authcontroller, verifyotpcontroller } from './di/container.js'
import { errorHandlingMiddleware } from './presentation/middlewares/ErrorHandlingMiddleware.js'
import createRoutes from './presentation/routes/index.js'
import express from 'express'

const app = express()

app.use((req, res, next) => {
    console.log("REQUEST ENTERED EXPRESS:", req.method, req.url)
    next()
})

app.use(express.json())

app.get('/', (req, res) => {
    console.log(' ROOT ROUTE REACHED')

    res.status(200).json({
        message: 'Server is working'
    })
})

app.use('/api', createRoutes(authcontroller,verifyotpcontroller))


app.use(errorHandlingMiddleware)

export default app



