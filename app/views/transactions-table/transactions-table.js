import {
  sessionStorageKey,
  filteredStoredTransactionsKey,
  updatedStoreEvent
} from './../../scripts/globals.js'

const tableWrapper = document.getElementById('transactions-table-container')

const buildTransactionsTable = () => {
  if (!tableWrapper) return

  const storedTransactions = JSON.parse(sessionStorage.getItem(sessionStorageKey)) || []
  const activeStoredTransactions = storedTransactions.filter(file => file.active)

  const filteredStoredTransactions = 
    JSON.parse(sessionStorage.getItem(filteredStoredTransactionsKey)) || 
    activeStoredTransactions

  const emptyMessage = tableWrapper.dataset.emptyMessage || 'No transactions available'
  const hasTransactions = filteredStoredTransactions.length > 0
  // const hasTransactions = storedTransactions.some(batch => Array.isArray(batch.data) && batch.data.length > 0)

  if (!hasTransactions) {
    const emptyCaseMessage = `<p>${emptyMessage}</p>`
    tableWrapper.innerHTML = emptyCaseMessage 
    return
  }
  
  let tableHTML = `
    <table id="table" class="table table-striped">
      <thead>
        <tr>
          <th>Order Id</th>
          <th>Date</th>
          <th>Exchange</th>
          <th>Pair</th>
          <th>Type</th>
          <th>Order Price</th>
          <th>Order Amount</th>
          <th>Avg. Trading Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
    `
  for (const batch of filteredStoredTransactions) {
    if (!Array.isArray(batch.data)) continue
    for (const t of batch.data) {
      const date = new Date(t.ts)
      const formattedDate = date.toLocaleString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
      tableHTML += `
          <tr>
            <td>${t.orderNo}</td>
            <td data-order="${t.ts}">${formattedDate}</td>
            <td>${batch.exchange}</td>
            <td>${t.pair}</td>
            <td>${t.type}</td>
            <td>${t.orderPrice}</td>
            <td>${t.orderAmount}</td>
            <td>${t.avgTradingPrice}</td>
            <td>${t.total}</td>
          </tr>
        `
    }
  }
  tableHTML += `
        </tbody>
      </table>
    `
  tableWrapper.innerHTML = tableHTML 
  
  if (hasTransactions) {
    // eslint-disable-next-line no-undef
    new DataTable('#table')
  }
}

export default  {
  init: async() => {
    const cssModule = await import('./transactions-table.css', {
      with: { type: 'css' }
    })
    try {
      document.adoptedStyleSheets = [cssModule.default]
    // Setting adoptedStyleSheets may fail in unsupported browsers; log the error for debugging.
    } catch (_err) { 
      // console.error('Error adopting style sheets:', err)
    }

    buildTransactionsTable()
    window.addEventListener(updatedStoreEvent, () => {
      buildTransactionsTable()
    })
  }
}
