/**
 * Home view module that initializes and manages the home page.
 * @namespace
 * @property {Function} init - Asynchronously initializes the home view by importing and applying CSS modules.
 * @returns {Promise<void>} A promise that resolves when the initialization is complete.
 * @throws {Error} Silently catches and ignores errors when adoptedStyleSheets is not supported by the browser.
 */
import {
  sessionStorageKey,
  filteredStoredTransactionsKey,
  updatedStoreEvent
} from './../../scripts/globals.js'

// let selectedExchanges = new Set()
// let selectedCrypto = new Set()

// const exchangeFilterMngmt = (transactions, isInitial) => {
//   const getAvailableExchanges = (transactions) => {
//     const uniqueExchanges = new Set()
//     transactions.forEach(file => {
//       if (file.exchange) {
//         uniqueExchanges.add(file.exchange)
//       }
//     })
//     return Array.from(uniqueExchanges).sort()
//   }
//   const renderExchangeFilters = (availableExchanges) => {
//     const $exchangeFilters = document.getElementById('exchange-filters')
//     if (!$exchangeFilters) return

//     // Clear existing filters
//     $exchangeFilters.replaceChildren()

//     // If no exchanges are available, show a placeholder
//     if (availableExchanges.length === 0) {
//       const $empty = document.createElement('span')
//       $empty.innerText = '-'
//       $exchangeFilters.appendChild($empty)
//       return
//     }

//     availableExchanges.forEach(exchange => {
//       const $label = document.createElement('label')

//       const $checkbox = document.createElement('input')
//       $checkbox.type = 'checkbox'
//       $checkbox.value = exchange
//       $checkbox.checked = selectedExchanges.has(exchange)
//       $checkbox.addEventListener('change', () => {
//         if ($checkbox.checked) {
//           selectedExchanges.add(exchange)
//         } else {
//           selectedExchanges.delete(exchange)
//         }
//         updateStats()
//       })

//       const $text = document.createElement('span')
//       $text.innerText = exchange

//       $label.appendChild($checkbox)
//       $label.appendChild($text)
//       $exchangeFilters.appendChild($label)
//     })
//   }
//   const availableExchanges = getAvailableExchanges(transactions)
//   const availableExchangesSet = new Set(availableExchanges)
//   selectedExchanges = new Set(
//     Array.from(selectedExchanges).filter(exchange => availableExchangesSet.has(exchange))
//   )
//   if (isInitial && selectedExchanges.size === 0) {
//     availableExchanges.forEach(exchange => selectedExchanges.add(exchange))
//   }
//   renderExchangeFilters(availableExchanges)
// }

// const cryptoFilterMngmt = (transactions, isInitial) => {
//   const getAvailableCrypto = (transactions) => {
//     const uniqueCrypto = new Set()
//     transactions.forEach(file => {
//       file.data.forEach(transaction => {
//         if (transaction.baseAsset && transaction.quoteAsset) {  
//           uniqueCrypto.add(transaction.baseAsset)
//           uniqueCrypto.add(transaction.quoteAsset)
//         }
//       })
//     })
//     return Array.from(uniqueCrypto).sort()
//   }
//   const renderCryptoFilters = (availableCrypto) => {
//     const $cryptoFilters = document.getElementById('crypto-filters')
//     if (!$cryptoFilters) return

//     $cryptoFilters.replaceChildren()

//     if (availableCrypto.length === 0) {
//       const $empty = document.createElement('span')
//       $empty.innerText = '-'
//       $cryptoFilters.appendChild($empty)
//       return
//     }

//     availableCrypto.forEach(crypto => {
//       const $label = document.createElement('label')

//       const $checkbox = document.createElement('input')
//       $checkbox.type = 'checkbox'
//       $checkbox.value = crypto
//       $checkbox.checked = selectedCrypto.has(crypto)
//       $checkbox.addEventListener('change', () => {
//         if ($checkbox.checked) {
//           selectedCrypto.add(crypto)
//         } else {
//           selectedCrypto.delete(crypto)
//         }
//         updateStats()
//       })

//       const $text = document.createElement('span')
//       $text.innerText = crypto

//       $label.appendChild($checkbox)
//       $label.appendChild($text)
//       $cryptoFilters.appendChild($label)
//     })
//   }
//   const availableCrypto = getAvailableCrypto(transactions)
//   const availableCryptoSet = new Set(availableCrypto)
//   selectedCrypto = new Set(
//     Array.from(selectedCrypto).filter(crypto => availableCryptoSet.has(crypto))
//   )
//   if (isInitial && selectedCrypto.size === 0) {
//     availableCrypto.forEach(crypto => selectedCrypto.add(crypto))
//   }
//   renderCryptoFilters(availableCrypto)
// }

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

const printGraphs = (transactions) => {
  const $charts = document.getElementById('charts')
  // function getCryptoUsage(transactions) {
  //   const usage = {}
  //   let total = 0
  //   transactions.forEach(file => {
  //     file.data.forEach(tx => {
  //       [tx.baseAsset, tx.quoteAsset].forEach(asset => {
  //         if (asset) {
  //           usage[asset] = (usage[asset] || 0) + 1
  //           total++
  //         }
  //       })
  //     })
  //   })
  //   return { usage, total }
  // }
  function getCryptoUsageBase(transactions) {
    const usage = {}
    let total = 0
    transactions.forEach(file => {
      file.data.forEach(tx => {
        [tx.baseAsset].forEach(asset => {
          if (asset) {
            usage[asset] = (usage[asset] || 0) + 1
            total++
          }
        })
      })
    })
    return { usage, total }
  }
  function getCryptoUsageQuote(transactions) {
    const usage = {}
    let total = 0
    transactions.forEach(file => {
      file.data.forEach(tx => {
        [tx.quoteAsset].forEach(asset => {
          if (asset) {
            usage[asset] = (usage[asset] || 0) + 1
            total++
          }
        })
      })
    })
    return { usage, total }
  }
  function renderCryptoUsagePie(transactions) {
    const $target = document.getElementById('crypto-usage-pie')
    if(!$target) return
    const { usage } = getCryptoUsageBase(transactions)
    // debugger
    const labels = Object.keys(usage)
    const data = labels.map(label => usage[label])

    const backgroundColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'
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
    const { usage } = getCryptoUsageQuote(transactions)
    const labels = Object.keys(usage)
    const data = labels.map(label => usage[label])

    const backgroundColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'
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

const printTransactionsData = (isInitial = false) => {
  const storedTransactions = JSON.parse(sessionStorage.getItem(sessionStorageKey)) || []
  const activeStoredTransactions = storedTransactions.filter(file => file.active)

  // exchangeFilterMngmt(activeStoredTransactions, isInitial)
  // cryptoFilterMngmt(activeStoredTransactions, isInitial)

  // const filteredStoredTransactions = activeStoredTransactions.filter(file => {
  //   if (!file.exchange) return false
  //   if (!file.data) return false
  //   return selectedExchanges.has(file.exchange) &&
  //   file.data.some(transaction => 
  //     (transaction.baseAsset && selectedCrypto.has(transaction.baseAsset)) ||
  //     (transaction.quoteAsset && selectedCrypto.has(transaction.quoteAsset))
  //   )
  // })

  // if(selectedCrypto.size !== 0) {
  //   filteredStoredTransactions.forEach(file => {
  //     file.data = file.data.filter(transaction => 
  //       (transaction.baseAsset && selectedCrypto.has(transaction.baseAsset)) ||
  //       (transaction.quoteAsset && selectedCrypto.has(transaction.quoteAsset))
  //     )
  //   })
  // }


  printStats(activeStoredTransactions)
  printGraphs(activeStoredTransactions)
  
  // sessionStorage.setItem(filteredStoredTransactionsKey, JSON.stringify(filteredStoredTransactions))

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

    printTransactionsData('page-loaded')
    window.addEventListener(updatedStoreEvent, () => {
      printTransactionsData()
    })
  }
}
