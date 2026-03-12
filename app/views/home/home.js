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


const updateStats = () => {
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

  const storedTransactions = JSON.parse(sessionStorage.getItem(sessionStorageKey)) || []

  const $filesCount = document.getElementById('files-count')
  const $totalTransactions = document.getElementById('total-transactions')
  const $cryptoCount = document.getElementById('crypto-count')
  const $cryptoList = document.getElementById('crypto-list')
  const $exchangesCount = document.getElementById('exchanges-count')
  const $exchangesList = document.getElementById('exchanges-list')

  const activeStoredTransactions = storedTransactions.filter(file => file.active)

  if(activeStoredTransactions.length === 0) {
    $filesCount.innerText = 0
    $totalTransactions.innerText = 0
    $cryptoCount.innerText = 0
    $cryptoList.innerText = '-'
    $exchangesCount.innerText = 0
    $exchangesList.innerText = '-'
    return
  }
  
  $filesCount.innerText = activeStoredTransactions.length
  $totalTransactions.innerText = activeStoredTransactions.reduce(
    (acc, file) => acc + (file.data ? file.data.length : 0), 0
  )  

  const cryptoStats = countUniqueCrypto(activeStoredTransactions)
  $cryptoCount.innerText = cryptoStats.count
  $cryptoList.innerText = cryptoStats.cryptos.join(', ')

  const exchangeStats = countUniqueExchanges(activeStoredTransactions)
  $exchangesCount.innerText = exchangeStats.count
  $exchangesList.innerText = exchangeStats.exchanges.join(', ')
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

    updateStats()
    window.addEventListener(updatedStoreEvent, () => {
      updateStats()
    })
  }
}
