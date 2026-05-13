import {
  sessionStorageKey,
  filteredStoredTransactionsKey,
  updatedStoreEvent
} from '../../scripts/globals.js'

const graphWrapper = document.getElementById('transactions-graph-container')

const buildTransactionsGraph = () => {
  if (!graphWrapper) return

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

  const filteredStoredTransactions = getFilteredTransactions()

  // const filteredStoredTransactions = 
  //   JSON.parse(sessionStorage.getItem(filteredStoredTransactionsKey)) || 
  //   activeStoredTransactions

  const emptyMessage = graphWrapper.dataset.emptyMessage || 'No transactions available'
  const hasTransactions = filteredStoredTransactions.length > 0
  //

  if (!hasTransactions) {
    const emptyCaseMessage = `<p>${emptyMessage}</p>`
    graphWrapper.innerHTML = emptyCaseMessage 
    return
  }

  graphWrapper.innerHTML = '' // Clear previous graph content

  filteredStoredTransactions.forEach(file => {
    const $section = document.createElement('section')
    $section.className = 'graph-section'
    const $title = document.createElement('h3')
    $title.textContent = `Exchange: ${file.exchange} | Origin: ${file.origin}`
    $section.appendChild($title)
    graphWrapper.appendChild($section)
    // Instantiate the graph
    // eslint-disable-next-line no-undef
    const gitgraph = GitgraphJS.createGitgraph($section, { orientation: 'vertical-reverse' })
    const map = new Map()
    const master = gitgraph.branch('Wallet ' + file.exchange)
    master.commit(
      {
        subject: 'Start transactions'
      })

    file.data.forEach((transaction, _i) => {

      if (map.has(transaction.baseAsset)) {
        //chiude operazione
        const branch = map.get(transaction.baseAsset)
        branch.commit(
          {
            tag: transaction.date || 'placeholder',
            subject: `${transaction.type} ${transaction.baseAsset} Q.ty ${transaction.orderAmount}`,
            body: `Price: ${transaction.orderPrice}`
          })
      } else {
        //apre nuova operazione
        const branch = master.branch(transaction.baseAsset)
        branch.commit(
          {
            tag: transaction.date || 'placeholder',
            subject: `${transaction.type} ${transaction.baseAsset} Q.ty ${transaction.orderAmount}`,
            body: `Price: ${transaction.orderPrice}`
          })

        map.set(transaction.baseAsset, branch)
      }

    })
  })
  
}

export default  {
  init: async() => {
    const cssModule = await import('./transactions-graph.css', {
      with: { type: 'css' }
    })
    try {
      document.adoptedStyleSheets = [cssModule.default]
    // Setting adoptedStyleSheets may fail in unsupported browsers; log the error for debugging.
    } catch (_err) { 
      // console.error('Error adopting style sheets:', err)
    }

    buildTransactionsGraph()
    window.addEventListener(updatedStoreEvent, () => {
      buildTransactionsGraph()
    })
  }
}
