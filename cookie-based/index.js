const express = require("express")
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// util to check whether a user is logged in
const isLoggedIn = (cookies) => {
  const authCookie = cookies["auth-example"]

  if (authCookie && authCookie === 'logged-in') {
    return true
  }

  return false
}

// util to check whether login attempt has been made
const hasLoginFailed = (queryString) => {
  console.log(queryString);
  if (queryString['login-failed'] && queryString['login-failed'] === 'true') {
    return true
  }
  
  return false
}

// home
app.get('/', (req, res, next) => {
  if (isLoggedIn(req.cookies)) {
    return res.send('<h1>Logged in</h1>')
  }

  return res.redirect('/login')  
})

// login page
app.get('/login', (req, res, next) => {
  if (isLoggedIn(req.cookies)) {
    return res.redirect('/')
  }
  
  let additionalHtml = ''
  
  if (hasLoginFailed(req.query)) {
    additionalHtml = '<p>Login attempt failed</p>'
  }

  const html = `
    <html>
      <head>
        <title>Login page</title>
      </head>
      <body>
        <h1>Please log in</h1>
        ${additionalHtml}
        <form action="/login" method="post">
          <input type="text" name="username" placeholder="Username" value="user" />
          <input type="password" name="password" placeholder="Password" value="1234" />
          <button>Login</button>
        </form>
      </body>
    </html>
  `

  res.status(200).send(html)
})

// process login
app.post('/login', (req, res, next) => {
  if (isLoggedIn(req.cookies)) {
    return req.redirect('/')
  }

  const credentials = { username: 'user', password: '1234' }

  if (
    credentials.username === req.body.username &&
    credentials.password === req.body.password
  ) {
    res.cookie('auth-example', 'logged-in', { maxAge: '60000', httpOnly: true })
    return res.redirect('/')
  }

  return res.redirect('/login?login-failed=true')
})

app.listen(5000)
