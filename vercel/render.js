import { createPageRenderer } from 'vite-plugin-ssr'
const { telefunc, telefuncConfig, provideTelefuncContext } = require('telefunc')
// `importBuild.js` enables Vercel to bundle our serverless functions, see https://vite-plugin-ssr.com/vercel and https://vite-plugin-ssr.com/importBuild.js
import '../dist/server/importBuild.js'
import '../dist/server/importTelefuncFiles.js'

const renderPage = createPageRenderer({ isProduction: true })

export default async function handler(req, res) {
  const { url } = req

  console.log('Request to url:', url)

  if (url.startsWith('/_telefunc')) {
    // provideTelefuncContext({})
    const body = await readTextStream(req)
    const httpResponse = await telefunc({ url, method: req.method, body })
    if (httpResponse) {
      const { body, statusCode, contentType } = httpResponse

      res.statusCode = statusCode
      res.setHeader('content-type', contentType)
      res.end(body)
      return
    }
  }

  const pageContextInit = { url }
  const pageContext = await renderPage(pageContextInit)
  const { httpResponse } = pageContext

  if (!httpResponse) {
    res.statusCode = 200
    res.end()
  } else {
    const { body, statusCode, contentType } = httpResponse

    res.statusCode = statusCode
    res.setHeader('content-type', contentType)
    res.end(body)
  }
}


const readTextStream = readableStream =>
  new Promise(resolve => {
    let text = ''
    readableStream.setEncoding('utf8')
    readableStream.on('data', chunk => (text += chunk))
    readableStream.on('end', () => resolve(text))
  })
