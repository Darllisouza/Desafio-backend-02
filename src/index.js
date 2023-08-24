import express from 'express' // importar o express
import routes from './routes.js'

const app = express() //criar instância

app.use(express.json()) //ler body com json

app.use(routes) //usar o router


export default app

