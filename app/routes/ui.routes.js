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

// upload file management
import multer from 'multer'
import getNormalizedDataFromUploadedFile from './get-normalized-data-from-uploaded-file.js'
const uploadDestinationFolder = 'uploads/'
const upload = multer({ dest: uploadDestinationFolder })
router.post(
  '/transactions-upload', 
  upload.single('file'),
  async(req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    try {
      const normalizedData = await getNormalizedDataFromUploadedFile(req.file)
      return res.status(200).json(normalizedData)
    } catch (error) {
      return res.status(500).json({
        error: error?.message ?? 'Unknown error'
      })
    }
  })

// Landing page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../landing-pages/landing.html'))
})
// Confirmation page
router.get('/form-submitted', (req, res) => {
  res.sendFile(path.join(__dirname, '../../landing-pages/confirm.html'))
})

// Privacy
router.get(`/mvp/:lang(${LANG_REGEX})/privacy`, 
  (req, res) => viewController(req, res, 'privacy', [{ name: 'privacy' }]))

// Contacts
router.get(`/mvp/:lang(${LANG_REGEX})/contacts`, 
  (req, res) => viewController(req, res, 'contacts', [{ name: 'contacts' }]))

// Transactions table
router.get(
  `/mvp/:lang(${LANG_REGEX})/transactions-table`, 
  (req, res) => viewController(req, res, 'transactions-table', [{ name: 'transactions-table' }]))

// Transactions graph
router.get(
  `/mvp/:lang(${LANG_REGEX})/transactions-graph`, 
  (req, res) => viewController(req, res, 'transactions-graph', [{ name: 'transactions-graph' }]))

// Home page
router.get(`/mvp/:lang(${LANG_REGEX})`, (req, res) => viewController(req, res, 'home', []))

// root page
router.get('/mvp', (req, res) => {
  // Get browser prefered language
  const lang = req.acceptsLanguages('en', 'it') || 'en'
  // Redirects
  res.redirect(301, `/mvp/${lang}`)
})

export default router
