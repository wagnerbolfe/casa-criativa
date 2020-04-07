const express = require('express')
const nunjucks = require('nunjucks')
const server = express()
const methodOverride = require('method-override')

const db = require('./db')

server.use(express.static('public'))
server.use(express.urlencoded({ extended: true }))
server.use(methodOverride('_method'))

nunjucks.configure('views', {
  express: server,
  noCache: true,
})

server.get('/', (req, res) => {

  db.all(`SELECT * FROM ideas`, (err, rows) => {
    if (err) return console.log(err)
    const reversedIdeas = [...rows].reverse()
    let lastIdeas = []
    for (let idea of reversedIdeas) {
      if(lastIdeas.length < 2) {
        lastIdeas.push(idea)
      }
    }
  
    return res.render('index.html', { ideas: lastIdeas })
  })

})

server.get('/ideias', (req, res) => {
  db.all(`SELECT * FROM ideas`, (err, rows) => {
    if (err) {
      console.log(err)
      return res.send('Erro no Banco de Dados !')
    }
    const reversedIdeas = [...rows].reverse()
    return res.render('ideias.html', { ideas: reversedIdeas })
  })

})

server.post('/', (req, res) => {
  const query = `
    INSERT INTO ideas(
      image,
      title,
      category,
      description,
      link
    ) VALUES(?,?,?,?,?);
  `

  const values = [
    req.body.image,
    req.body.title,
    req.body.category,
    req.body.description,
    req.body.link,
  ]

  db.run(query, values, (err) => {
    if (err) {
      console.log(err)
      return res.send('Erro no Banco de Dados !')
    }

    return res.redirect('/ideias')
  })

})

server.delete('/', (req, res) => {

  let { id } = req.body
  db.run(`DELETE FROM ideas WHERE id = ?`, [id], (err) => {
    if (err) {
      return res.send('Erro no Banco de Dados !')
    }
    return res.redirect('/')
  })

})

server.listen(3000)