/**
 * Main entry point for the application.
 * Initializes shared components and dynamically loads page-specific modules based on the page ID.
 * 
 * @file /app/scripts/index.js
 * 
 * @description
 * This script performs the following operations:
 * 1. Initializes shared components (main menu, go-to-top button, cookie layer)
 * 2. Retrieves the current page ID from the document body
 * 3. Dynamically imports and executes page-specific modules if available
 * 
 * @requires ../views/components/shared/header/main-menu/main-menu.js
 * @requires ../views/components/shared/goto_top/goto_top.js
 * @requires ../views/components/shared/cookie_layer/cookie_layer.js
 * 
 * @example
 * // For a page with body id="home", the home module will be loaded
 * // <body id="home">
 * 
 * @constant {string} pageId - The ID of the current page from document.body.id
 * @constant {Object} modules - Map of page IDs to their corresponding dynamic import functions
 * @property {Function} modules.home - Dynamic import function for the home page module
 * @property {Function} modules.users - Dynamic import function for the users page module
 */

import mainMenu from '../views/components/shared/header/main-menu/main-menu.js'
import column from '../views/components/shared/column/column.js'
import './CmpBullet.js'
import gotoTop from '../views/components/shared/goto_top/goto_top.js'
import cookieLayer from '../views/components/shared/cookie_layer/cookie_layer.js'

const pageId = document.body.id

mainMenu.toggleMobileMenu()
column.init()
gotoTop.init()
cookieLayer.init()

// Import views specific scripts
const modules = {
  home: () => import('../views/home/home.js')
}

// Execute view specific script
if (modules[pageId]) {
  await modules[pageId]().then(async(module) => {
    await module.default?.init?.()
  }).catch((err) => {
    console.error('Failed to load module:', pageId, err)
  })
}

