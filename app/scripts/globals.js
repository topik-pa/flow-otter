/**
 * Application status constants.
 * Defines the possible states for asynchronous operations throughout the application.
 * @constant {Object} STATUS
 * @property {string} idle - Initial state before any operation starts
 * @property {string} loading - State during an ongoing operation
 * @property {string} success - State when operation completed successfully
 * @property {string} error - State when operation failed with an error
 */

const STATUS = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  error: 'error'
}

export const sessionStorageKey = 'fo-transactions'
export const updatedStoreEvent = 'fo-updated'

export function updateStatus(targets, status) {
  if (!(status in STATUS)) {
    throw new Error(`Invalid status: ${status}`)
  }
  targets.forEach((target) => {
    target.classList.remove(...Object.values(STATUS))
    target.classList.add(STATUS[status])
  })
}

export function createComponent(tag, attrs = {}, children = []) {
  const el = document.createElement(tag)
  // Imposta attributi
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value)
  }
  // Aggiunge i figli (contenuto, slot, ecc.)
  for (const child of children) {
    if (!child) continue
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(child))
    } else {
      el.appendChild(child)
    }
  }
  return el
}
