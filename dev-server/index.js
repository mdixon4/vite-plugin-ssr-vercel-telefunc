// We use a normal Express server for development

const express = require('express')
const { createPageRenderer } = require('vite-plugin-ssr')
const vite = require('vite')
const { telefunc, telefuncConfig, provideTelefuncContext } = require('telefunc')

const isProduction = process.env.NODE_ENV === 'production'
const root = `${__dirname}/..`

startServer()

async function startServer() {
  const app = express()

  let viteDevServer
  if (isProduction) {
    app.use(express.static(`${root}/dist/client`))
  } else {
    viteDevServer = await vite.createServer({
      root,
      server: { middlewareMode: 'ssr' },
    })
    app.use(viteDevServer.middlewares)
    telefuncConfig.viteDevServer = viteDevServer
  }

  app.use(function (req, _res, next) {
    req.user = {
      id: 0,
      name: 'Elisabeth',
    }
    next()
  })

  app.use(express.text())
  app.all('/_telefunc', async (req, res) => {
    const { user } = req
    provideTelefuncContext({ user })
    const httpResponse = await telefunc({ url: req.originalUrl, method: req.method, body: req.body })
    const { body, statusCode, contentType } = httpResponse
    res.status(statusCode).type(contentType).send(body)
  })

  const renderPage = createPageRenderer({ viteDevServer, isProduction, root })
  app.get('*', async (req, res, next) => {
    const url = req.originalUrl
    const pageContextInit = {
      url,
    }
    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    if (!httpResponse) return next()
    const { body, statusCode, contentType } = httpResponse
    res.status(statusCode).type(contentType).send(body)
  })

  const port = 3000
  app.listen(port)
  console.log(`Server running at http://localhost:${port}`)
}
