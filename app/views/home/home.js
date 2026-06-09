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


const printStats = (transactions) => {
  function countUniqueCrypto(transactions) {
    const uniqueCryptos = new Set()
    transactions.forEach(file => {
      file.data.forEach(transaction => {
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

const printFilters = (transactions) => {
  // console.log('Updating filters ')
  const getAvailableFilters = () => {
    const uniqueExchangeFilters = new Set()
    const uniqueCryptoFilters = new Set()
    transactions.forEach(file => {
      if (file.exchange) {
        uniqueExchangeFilters.add(file.exchange)
      }
      file.data.forEach(transaction => {
        if (transaction.baseAsset && transaction.quoteAsset) {  
          uniqueCryptoFilters.add(transaction.baseAsset)
          uniqueCryptoFilters.add(transaction.quoteAsset)
        }
      })
    })
    const availableExchanges = Array.from(uniqueExchangeFilters).sort()
    const availableCryptos = Array.from(uniqueCryptoFilters).sort()
    return { availableExchanges, availableCryptos }
  }
  const filterMngmt = () => {
    const filters = JSON.parse(sessionStorage.getItem('filters')) || {}
    const { availableExchanges, availableCryptos } = getAvailableFilters()
    availableExchanges.forEach(exchange => {
      if (!filters.exchanges || filters.exchanges[exchange] === undefined) {
        filters.exchanges = filters.exchanges || {}
        filters.exchanges[exchange] = true
      }
    })
    availableCryptos.forEach(crypto => {
      if (!filters.cryptos || filters.cryptos[crypto] === undefined) {
        filters.cryptos = filters.cryptos || {}
        filters.cryptos[crypto] = true
      }
    })
    if (filters.exchanges) {
      for (const exchange of Object.keys(filters.exchanges)) {
        if (!availableExchanges.includes(exchange)) {
          delete filters.exchanges[exchange]
        }
      }
    }   if (filters.cryptos) {
      for (const crypto of Object.keys(filters.cryptos)) {
        if (!availableCryptos.includes(crypto)) {
          delete filters.cryptos[crypto]
        }
      }
    }
    sessionStorage.setItem('filters', JSON.stringify(filters))
  }
  const renderFilters = () => {
    const $exchangeFilters = document.getElementById('exchange-filters')
    const $cryptoFilters = document.getElementById('crypto-filters')
    if(!$exchangeFilters || !$cryptoFilters) return

    // Clear existing filters
    $exchangeFilters.replaceChildren()
    $cryptoFilters.replaceChildren()
    const filters = JSON.parse(sessionStorage.getItem('filters')) || {}
    // If no exchanges are available, show a placeholder
    if (!filters.exchanges || Object.keys(filters.exchanges).length === 0) {
      const $empty = document.createElement('span')
      $empty.innerText = '-'
      $exchangeFilters.appendChild($empty)
    }
    if (!filters.cryptos || Object.keys(filters.cryptos).length === 0) {
      const $empty = document.createElement('span')
      $empty.innerText = '-'
      $cryptoFilters.appendChild($empty)
    }
    if (filters.exchanges) {
      for (const exchange of Object.keys(filters.exchanges)) {
        const $label = document.createElement('label')
        const $checkbox = document.createElement('input')
        $checkbox.type = 'checkbox'
        $checkbox.value = exchange
        $checkbox.checked = filters.exchanges[exchange]
        $checkbox.addEventListener('change', () => {
          filters.exchanges = filters.exchanges || {}
          filters.exchanges[exchange] = $checkbox.checked
          sessionStorage.setItem('filters', JSON.stringify(filters))
          window.dispatchEvent(new Event(updatedStoreEvent))
        })
        const $text = document.createElement('span')
        $text.innerText = exchange
        $label.appendChild($checkbox)
        $label.appendChild($text)
        $exchangeFilters.appendChild($label)
      }
    }
    if (filters.cryptos) {
      for (const crypto of Object.keys(filters.cryptos)) {
        const $label = document.createElement('label')
        const $checkbox = document.createElement('input')
        $checkbox.type = 'checkbox'
        $checkbox.value = crypto
        $checkbox.checked = filters.cryptos[crypto]
        $checkbox.addEventListener('change', () => {
          filters.cryptos = filters.cryptos || {}
          filters.cryptos[crypto] = $checkbox.checked
          sessionStorage.setItem('filters', JSON.stringify(filters))
          window.dispatchEvent(new Event(updatedStoreEvent))
        })
        const $text = document.createElement('span')
        $text.innerText = crypto
        $label.appendChild($checkbox)
        $label.appendChild($text)
        $cryptoFilters.appendChild($label)
      }
    }
    
  }

  filterMngmt()
  renderFilters()
}

const printGraphs = (transactions) => {
  const $charts = document.getElementById('charts')
  function getCryptoUsage(transactions) {
    const usage = {}
    const baseUsage = {}
    const quoteUsage = {}
    let total = 0
    transactions.forEach(file => {
      file.data.forEach(tx => {
        [tx.baseAsset, tx.quoteAsset].forEach(asset => {
          if (asset) {
            usage[asset] = (usage[asset] || 0) + 1
            total++
          }
        })
        if (tx.baseAsset) {
          baseUsage[tx.baseAsset] = (baseUsage[tx.baseAsset] || 0) + 1
        }
        if (tx.quoteAsset) {
          quoteUsage[tx.quoteAsset] = (quoteUsage[tx.quoteAsset] || 0) + 1
        }
      })
    })
    return { usage, baseUsage, quoteUsage, total }
  }
  function renderCryptoUsagePie(transactions) {
    const $target = document.getElementById('crypto-usage-pie')
    if(!$target) return
    const { baseUsage } = getCryptoUsage(transactions)
    const labels = Object.keys(baseUsage)
    const data = labels.map(label => baseUsage[label])

    const backgroundColors = [
      '#773621', '#377721', '#216277', '#622177', '#627721', '#627721', '#216277', '#372177'
    ]
    // Destroy previous chart if exists
    if (window.cryptoPieChart) {
      window.cryptoPieChart.destroy()
    }
    // eslint-disable-next-line no-undef
    window.cryptoPieChart = new Chart($target, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: backgroundColors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Base asset crypto usage'
          }
        }
      }
    })
  }
  function renderCryptoVolumeBar(transactions) {
    const $target = document.getElementById('crypto-volume-bar')
    if(!$target) return
    const { quoteUsage } = getCryptoUsage(transactions)
    const labels = Object.keys(quoteUsage)
    const data = labels.map(label => quoteUsage[label])

    const backgroundColors = [
      '#773621', '#217762', '#213777', '#773721', '#217737', '#372177', '#216277'
    ]
  
    if (window.cryptoBarChart) {
      window.cryptoBarChart.destroy()
    }
  
    // eslint-disable-next-line no-undef
    window.cryptoBarChart = new Chart($target, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Transaction Volume',
          data,
          backgroundColor: backgroundColors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Quote asset transaction volume'
          }
        }
      }
    })
  }
  if(transactions.length === 0) {
    if($charts) $charts.classList.add('hide')
    if (window.cryptoPieChart) {
      window.cryptoPieChart.destroy()
    }
    if (window.cryptoBarChart) {
      window.cryptoBarChart.destroy()
    }
  } else {
    if($charts) $charts.classList.remove('hide')
    renderCryptoUsagePie(transactions)
    renderCryptoVolumeBar(transactions)
  }
}

const printTransactionsData = () => {
  const getFilteredTransactions = () => {
    const filters = JSON.parse(sessionStorage.getItem('filters')) || {}
    const selectedExchanges = filters.exchanges ? 
      Object.keys(filters.exchanges).filter(exchange => filters.exchanges[exchange]) : []
    const selectedCryptos = filters.cryptos ? 
      Object.keys(filters.cryptos).filter(crypto => filters.cryptos[crypto]) : []
    const filteredStoredTransactions = activeStoredTransactions.filter(file => {
      return selectedExchanges.includes(file.exchange)
    })
    filteredStoredTransactions.forEach(file => {
      file.data = file.data.filter(transaction => {
        return (transaction.baseAsset && selectedCryptos.includes(transaction.baseAsset)) &&
        (transaction.quoteAsset && selectedCryptos.includes(transaction.quoteAsset))
      })
    })
    return filteredStoredTransactions
  }
  const storedTransactions = JSON.parse(sessionStorage.getItem(sessionStorageKey)) || []
  const activeStoredTransactions = storedTransactions.filter(file => file.active)

  printFilters(activeStoredTransactions)

  const $welcome = document.getElementById('welcome')
  if ($welcome) {
    if (activeStoredTransactions.length === 0) {
      $welcome.classList.remove('hide')
    } else {
      $welcome.classList.add('hide')
    }
  }

  const filteredStoredTransactions = getFilteredTransactions()

  printStats(filteredStoredTransactions)
  printGraphs(filteredStoredTransactions)
  
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

    printTransactionsData()
    window.addEventListener(updatedStoreEvent, () => {
      printTransactionsData()
    })
  }
}
