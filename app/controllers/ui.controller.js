/**
 * Renders a view with localization support and SEO metadata
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} viewId - The identifier of the view to render
 * @param {Array} [breadcrumbs=[]] - Array of breadcrumb objects for navigation
 * @param {Array} [data=[]] - Additional data to pass to the view
 * @returns {void}
 * @description
 * This controller handles view rendering with the following features:
 * - Language validation and fallback to English
 * - Automatic redirect for unsupported languages
 * - Generation of canonical URLs and hreflang tags for SEO
 * - Sets i18n locale based on the language parameter
 */

import { i18n } from '../../server.js'

export function viewController(req, res, viewId, breadcrumbs=[], data=[]) {
  const supportedLangs = ['en', 'it']
  const fallback = 'en'
  const lang = req.params.lang || fallback

  const getViewParams = function(id, lang, path) {
    const baseUrl = process.env.BASE_URL || 'https://flow-otter.com'
    const canonicalUrl = `${baseUrl}${path}`
    const hreflangs = supportedLangs.map(langCode => ({
      lang: langCode,
      url: `${baseUrl}${path.startsWith(`/${lang}`) ? 
        path.replace(new RegExp(`^/${lang}`), `/${langCode}`) : 
        `/${langCode}${path}`}`
    }))
    return {
      id,
      canonicalUrl,
      hreflangs,
      lang,
      breadcrumbs,
      data
    }
  }
  
  if (!supportedLangs.includes(lang)) {
    res.redirect(req.url.replace(new RegExp(`^/${lang}`), `/${fallback}`))
  } else {
    i18n.setLocale(req, lang)
    res.render(`${viewId}/${viewId}`, getViewParams(viewId, lang, req.path))
  }
}
