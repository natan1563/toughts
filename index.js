const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const flash = require('express-flash')

const app = express()
const conn = require('./db/conn')

app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')

// receber a resposta do body

app.use(
  express.urlencoded({extended: true})
)

app.use(express.json())

app.use(
  session({
    name: 'session',
    secret: 'nosso_secret',
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      logFn: () => {},
      path: require('path').join(require('os').tmpdir(), 'sessions')
    }),
    cookie: {
      secure: false,
      maxAge: 360000,
      expires: new Date(Date.now() + 360000),
      httpOnly: true
    }
  })
)

// flash messages 
app.use(flash())

// public path 
app.use(express.static('public'))

app.use((req, res, next) => {
  if (req.session.userId) {
    res.locals.session = req.session 
  }

  next()
})

conn
  .sync()
  .then(() => {
    app.listen(3000)
  })
  .catch(err => console.log(err))