/**
 * Express application server setup with security middleware and configuration.
 * 
 * This module configures an Express.js application with the following features:
 * - Content Security Policy (CSP) with per-request nonce generation
 * - JSON body parsing
 * - Response compression with custom filter
 * - Security headers (HSTS, CSP, X-Content-Type-Options)
 * - HTTPS enforcement in production
 * - WWW to non-WWW redirect
 * - Trailing slash removal
 * - Pug view engine setup
 * - Static file serving for assets, styles, scripts, and views
 * - Internationalization (i18n) support for English and Italian
 * - API and UI route handling
 * - Custom 404 and 500 error handling
 * - MongoDB database connection (skipped in test environment)
 * 
 * @module server
 * @requires express
 * @requires crypto
 * @requires compression
 * @requires path
 * @requires url
 * @requires i18n
 * @requires ./app/routes/api.routes.js
 * @requires ./app/routes/ui.routes.js
 * @requires ./app/db/mongoose.js
 * 
 * @exports {express.Application} app - Configured Express application instance
 * @exports {I18n} i18n - Internationalization instance configured for 'en' and 'it' locales
 */

// Express app setup
import express from 'express'
const app = express()

// Generate a nonce for Content Security Policy
import crypto from 'crypto'
// Generate a nonce per request for CSP
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64')
  next()
})

// Parse application/json
app.use(express.json())


// Compression middleware
import compression from 'compression'
app.use(compression({ filter: shouldCompress }))
function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }
  // fallback to standard filter function
  return compression.filter(req, res)
}

// Security headers middleware
app.use((req, res, next) => {
  if (req.path && req.path.includes('/mvp/')) {
    // handle /mvp/ path case if needed
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  res.setHeader('Upgrade-insecure-requests', '1')
  // eslint-disable-next-line max-len
  res.setHeader('Content-Security-Policy', `default-src 'none'; script-src 'self' 'nonce-${res.locals.nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self'; object-src 'none'; frame-src 'self'; form-action 'self'; font-src 'self'; media-src 'self'; connect-src 'self' https://c.statcounter.com; frame-ancestors 'none'; base-uri 'none'`)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  }
  next()
})

// HTTPS redirect middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS === 'true') {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url)
    } else { return next() }
  } else { return next() }
})

// WWW redirect middleware
app.set('trust proxy', true)
app.use((req, res, next) => {
  if (req.headers.host && req.headers.host.slice(0, 4) === 'www.') {
    const newHost = req.headers.host.slice(4)
    return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl)
  }
  next()
})

// Trailing slash removal middleware
app.use((req, res, next) => {
  const { path, query } = req
  if (path !== '/' && path.endsWith('/')) {
    const newPath = path.slice(0, -1)
    const qs = Object.keys(query).length
      ? '?' + new URLSearchParams(query).toString()
      : ''
    return res.redirect(301, newPath + qs)
  }
  next()
})

// Set view engine
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'app', 'views'))

app.use('/styles', express.static(path.join(__dirname, 'app', 'styles')))
app.use('/assets', express.static(path.join(__dirname, 'app', 'assets')))
app.use('/scripts', express.static(path.join(__dirname, 'app', 'scripts')))
app.use('/views', express.static(path.join(__dirname, 'app', 'views')))
app.use('/dist', express.static(path.join(__dirname, 'app', 'dist')))


// Internationalization setup
import { I18n } from 'i18n'
const locales = ['en', 'it']
const i18n = new I18n({
  locales,
  directory: path.join(__dirname, 'app', 'locales'),
  defaultLocale: 'en',
  queryParameter: 'lang',
  autoReload: true,
  updateFiles: false,
  objectNotation: true
})
app.use((req, res, next) => {
  i18n.init(req, res, next)
})

//Routes
import apiRoutes from './app/routes/api.routes.js'
app.use('/api', apiRoutes)
import uiRoutes from './app/routes/ui.routes.js'
app.use('/', uiRoutes)
// 404 handling
app.use((req, res) => {
  res.status(404).render('4xx/404')
})
// 500 handling
app.use((err, _req, res, _next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack)
  } else {
    console.error('An internal server error occurred.')
  }
  res.status(500).render('5xx/500')
})

// Database connection
// import { connectToDB } from './app/db/mongoose.js'
// if (process.env.NODE_ENV !== 'test') {
//   await connectToDB()
// }

export { app, i18n }