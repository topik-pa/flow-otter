/**
 * Express router for UI routes.
 * Handles static files (sitemap, robots.txt, favicon) and page rendering.
 * Supports internationalization with language prefixes (it|en).
 * 
 * @module routes/ui.routes
 * @requires express
 * @requires path
 * @requires ../controllers/db.controller
 * @requires ../controllers/ui.controller
 * @requires url
 * 
 * Routes:
 * - GET /sitemap.xml - Serves the sitemap file
 * - GET /robots.txt - Serves the robots.txt file
 * - GET /favicon.ico - Serves the favicon file
 * - GET /:lang/users - Displays users page with data from database
 * - GET /:lang/privacy - Displays privacy page
 * - GET /:lang/contacts - Displays contacts page
 * - GET /:lang - Displays home page
 * - GET / - Redirects to home page with browser's preferred language
 * 
 * @constant {string} LANG_REGEX - Regex pattern for supported languages (it|en)
 */
// This code works with Express version 4.x

import express from 'express'
import path from 'path'
import { getAllUsers } from '../controllers/db.controller.js'
import { viewController } from '../controllers/ui.controller.js'
import { fileURLToPath } from 'url'

const router = express.Router()
const LANG_REGEX = 'it|en'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

router.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/sitemap.xml'))
})
// robots.txt
router.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/robots.txt'))
})
// favicon.ico
router.get('/favicon.ico', (req, res) => {
  res.sendFile('/public/favicon.ico', { root: './app' })
})

// Users
/* router.get(`/:lang(${LANG_REGEX})/users`, async(req, res) => {
  try {
    const users = await getAllUsers()
    viewController(req, res, 'users', [{ name: 'users' }], users)
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}) */

// Privacy
router.get(`/:lang(${LANG_REGEX})/privacy`, (req, res) => viewController(req, res, 'privacy', [{ name: 'privacy' }]))

// Contacts
router.get(`/:lang(${LANG_REGEX})/contacts`, (req, res) => viewController(req, res, 'contacts', [{ name: 'contacts' }]))

// Transactions table
router.get(
  `/:lang(${LANG_REGEX})/transactions-table`, 
  (req, res) => viewController(req, res, 'transactions-table', [{ name: 'transactions-table' }]))

// Transactions graph
router.get(
  `/:lang(${LANG_REGEX})/transactions-graph`, 
  (req, res) => viewController(req, res, 'transactions-graph', [{ name: 'transactions-graph' }]))

// Home page
router.get(`/:lang(${LANG_REGEX})`, (req, res) => viewController(req, res, 'home', []))

// root page
router.get('/', (req, res) => {
  // Get browser prefered language
  const lang = req.acceptsLanguages('en', 'it') || 'en'
  // Redirects
  res.redirect(301, `/${lang}`)
})

export default router
