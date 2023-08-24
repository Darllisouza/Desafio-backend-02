import app from './index.js'

const port = process.env.port || 3000 // porta passada pelo serviço de hospedagem ou 3000


//escutar rota (colocado dentro do else porque só precisamos do servidor se tivermos uma conexão com a bd)
app.listen(port, () => {
  console.log(`Servidor rodando no endereço http://localhost:${port}`)
})
