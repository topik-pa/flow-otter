/**
 * Home view module that initializes and manages the home page.
 * @namespace
 * @property {Function} init - Asynchronously initializes the home view by importing and applying CSS modules.
 * @returns {Promise<void>} A promise that resolves when the initialization is complete.
 * @throws {Error} Silently catches and ignores errors when adoptedStyleSheets is not supported by the browser.
 */
import {
  sessionStorageKey,
  updatedStoreEvent
} from './../../scripts/globals.js'

let selectedExchanges = new Set()

const exchangeFilterMngmt = (transactions, isInitial) => {
  const getAvailableExchanges = (transactions) => {
    const uniqueExchanges = new Set()
    transactions.forEach(file => {
      if (file.exchange) {
        uniqueExchanges.add(file.exchange)
      }
    })
    return Array.from(uniqueExchanges).sort()
  }
  const renderExchangeFilters = (availableExchanges) => {
    const $exchangeFilters = document.getElementById('exchange-filters')
    if (!$exchangeFilters) return

    $exchangeFilters.replaceChildren()

    if (availableExchanges.length === 0) {
      const $empty = document.createElement('span')
      $empty.innerText = '-'
      $exchangeFilters.appendChild($empty)
      return
    }

    availableExchanges.forEach(exchange => {
      const $label = document.createElement('label')

      const $checkbox = document.createElement('input')
      $checkbox.type = 'checkbox'
      $checkbox.value = exchange
      $checkbox.checked = selectedExchanges.has(exchange)
      $checkbox.addEventListener('change', () => {
        if ($checkbox.checked) {
          selectedExchanges.add(exchange)
        } else {
          selectedExchanges.delete(exchange)
        }
        updateStats()
      })

      const $text = document.createElement('span')
      $text.innerText = exchange

      $label.appendChild($checkbox)
      $label.appendChild($text)
      $exchangeFilters.appendChild($label)
    })
  }
  const availableExchanges = getAvailableExchanges(transactions)
  const availableExchangesSet = new Set(availableExchanges)
  selectedExchanges = new Set(
    Array.from(selectedExchanges).filter(exchange => availableExchangesSet.has(exchange))
  )
  if (isInitial && selectedExchanges.size === 0) {
    availableExchanges.forEach(exchange => selectedExchanges.add(exchange))
  }
  renderExchangeFilters(availableExchanges)
}

const printStats = (transactions) => {
  function countUniqueCrypto(transactions) {
    const uniqueCryptos = new Set()
    transactions.forEach(file => {
      file.data.forEach(transaction => {
      // Further processing can be done here if needed
        if (transaction.baseAsset) {
          uniqueCryptos.add(transaction.baseAsset)
        }
        if (transaction.quoteAsset) {
          uniqueCryptos.add(transaction.quoteAsset)
        }
      })
    })
    return {
      count: uniqueCryptos.size,
      cryptos: Array.from(uniqueCryptos).sort()
    }
  }
  function countUniqueExchanges(transactions) {
    const uniqueExchanges = new Set()
    transactions.forEach(file => {
      // Further processing can be done here if needed
      if (file.exchange) {
        uniqueExchanges.add(file.exchange)
      }
    })
    return {
      count: uniqueExchanges.size,
      exchanges: Array.from(uniqueExchanges).sort()
    }
  }
  const $filesCount = document.getElementById('files-count')
  const $totalTransactions = document.getElementById('total-transactions')
  const $cryptoCount = document.getElementById('crypto-count')
  const $cryptoList = document.getElementById('crypto-list')
  const $exchangesCount = document.getElementById('exchanges-count')
  const $exchangesList = document.getElementById('exchanges-list')

  if(transactions.length === 0) {
    $filesCount.innerText = 0
    $totalTransactions.innerText = 0
    $cryptoCount.innerText = 0
    $cryptoList.innerText = '-'
    $exchangesCount.innerText = 0
    $exchangesList.innerText = '-'
    return
  }

  $filesCount.innerText = transactions.length
  $totalTransactions.innerText = transactions.reduce(
    (acc, file) => acc + (file.data ? file.data.length : 0), 0
  )  

  const cryptoStats = countUniqueCrypto(transactions)
  $cryptoCount.innerText = cryptoStats.count
  $cryptoList.innerText = cryptoStats.cryptos.join(', ')

  const exchangeStats = countUniqueExchanges(transactions)
  $exchangesCount.innerText = exchangeStats.count
  $exchangesList.innerText = exchangeStats.exchanges.join(', ')
}

const updateStats = (isInitial = false) => {
  const storedTransactions = JSON.parse(sessionStorage.getItem(sessionStorageKey)) || []
  const activeStoredTransactions = storedTransactions.filter(file => file.active)

  exchangeFilterMngmt(activeStoredTransactions, isInitial)

  const filteredStoredTransactions = activeStoredTransactions.filter(file => {
    if (!file.exchange) return false
    return selectedExchanges.has(file.exchange)
  })

  printStats(filteredStoredTransactions)
}

export default  {
  init: async() => {
    const cssModule = await import('./home.css', {
      with: { type: 'css' }
    })
    try {
      document.adoptedStyleSheets = [cssModule.default]
    // Setting adoptedStyleSheets may fail in unsupported browsers; log the error for debugging.
    } catch (err) { 
      // console.error('Error adopting style sheets:', err)
    }

    updateStats(true)
    window.addEventListener(updatedStoreEvent, () => {
      updateStats()
    })
  }
}
