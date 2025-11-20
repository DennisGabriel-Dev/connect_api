import express from 'express'
import usuariosRoutes from './routes/usuariosRoutes.js'
const app = express()
const port = 5000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/usuarios', usuariosRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
