import XLSX from 'xlsx'
import fs from 'fs'
import csv from 'csv-parser'
import crypto from 'crypto'

const getExcelData = (file) => {
  const getDataFromBinance = (sheet) => {
    const transactions = sheet.filter(row => {return row['Status'] === 'Filled'}).map(row => (
      {
        ts: new Date(row['Date(UTC)']).getTime(),
        date: row['Date(UTC)'],
        orderNo: row['Order No.'],
        pair: row['Pair'],
        baseAsset: row['Base Asset'],
        quoteAsset: row['Quote Asset'],
        type: row['Type'],
        orderPrice: row['Order Price'],
        avgTradingPrice: +(+(row['AvgTrading Price'])).toFixed(4),
        orderAmount: row['Order Amount'],
        total: +(+(row['Total'])).toFixed(4)
      }
    ))
    return { 
      id: crypto.randomBytes(16).toString('base64'),
      date: new Date().getTime(),
      format: 'excel',
      exchange: 'Binance',
      origin: file.originalname,
      data: transactions.sort((a, b) => a.ts - b.ts)
    }
  }

  const workbook = XLSX.readFile(file.path)
  const sheetName = workbook.SheetNames[0]
  const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    defval: ''
  })
  if (sheet.length === 0) {
    throw new Error('Uploaded Excel file is empty')
  }
  if (
    sheet[0]['Date(UTC)'] && 
      sheet[0]['Order No.'] && 
      sheet[0]['AvgTrading Price'] 
  ){
    //Binance format
    return getDataFromBinance(sheet)
  }
  throw new Error('Unsupported Excel file format')
}

const getCSVData = (file) => {
  const getTransactionFromBybit = (row) => {
    if (row['Filled Type'] === 'Trade') {
      const baseAsset = row['Market'].replace(row['feeCoin'], '')
      const quoteAsset = row['feeCoin']
      const pair = baseAsset + '/' + quoteAsset
      return {
        ts: new Date(row['Transaction Time(UTC+0)']).getTime(),
        date: row['Transaction Time(UTC+0)'],
        orderNo: row['Order No.'],
        baseAsset: baseAsset,
        quoteAsset: quoteAsset,
        pair: pair,
        type: row['Direction'] === 'Short' ? 'SELL' : 'BUY',
        orderPrice: +row['Order Price'],
        avgTradingPrice: +row['Filled Price'],
        orderAmount: +row['Filled Quantity'],
        total: +(row['Filled Price'] * row['Filled Quantity']).toFixed(4)
      }
    }
  }
  const getTransactionFromCoinbase = (row) => {
    if (row['_2'] === 'Buy' || row['_2'] === 'Sell') {
      return {
        ts: new Date(row['_1']).getTime(),
        date: row['_1'],
        orderNo: row['_0'],
        pair: row['_3']+'/'+row['_5'],
        baseAsset: row['_3'],
        quoteAsset: row['_5'],
        type: row['_2'].toUpperCase(),
        orderPrice: +(+(row['_6'].replace(/€/g, ''))).toFixed(4),
        avgTradingPrice: +(+(row['_6'].replace(/€/g, ''))).toFixed(4),
        orderAmount: +(+(row['_4'])).toFixed(4),
        total: +(+(row['_7'].replace(/€/g, ''))).toFixed(4)
      }
    }
  }
  const cleanBybitTransactions = (transactions) => {
    const map = new Map()
    for (const t of transactions) {
      if (!map.has(t.orderNo)) {
        map.set(t.orderNo, { ...t })
      } else {
        const existing = map.get(t.orderNo)
        existing.orderAmount = +(existing.orderAmount + t.orderAmount).toFixed(4)
        existing.filled = +(existing.filled + t.filled).toFixed(4) 
        existing.total = +(existing.total + t.total).toFixed(4) 
      }
    }
    transactions = Array.from(map.values())
    transactions.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts))
    return transactions
  }
  
  const filePath = file.path
  let csvFormat
  let transactions = []
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if(
          row['Filled Type'] && 
          row['ExecFeeV2'] && 
          row['Trading Fee']
        ) {
          //Bybit format
          csvFormat = 'Bybit'
          const transaction = getTransactionFromBybit(row)
          if (transaction) transactions.push(transaction)
        }
        if(
          row['_0'] && 
            row['_1'] && 
            row['_10'] &&
            row['_0'] !== 'ID'
        ) {
          //Coinbase format
          csvFormat = 'Coinbase'
          const transaction = getTransactionFromCoinbase(row)
          if (transaction) transactions.push(transaction)
        }
      })
      .on('end', () => {
        fs.unlinkSync(filePath)
        if (csvFormat === 'Bybit') {
          transactions = cleanBybitTransactions(transactions)
        } 
        if(csvFormat === 'Bybit' || csvFormat === 'Coinbase') {
          resolve({ 
            id: crypto.randomBytes(16).toString('base64'),
            date: new Date().getTime(),
            format: 'csv',
            exchange: csvFormat,
            origin: file.originalname,
            data: transactions.sort((a, b) => a.ts - b.ts)
          })
        }
        reject('Unsupported CSV file format')
      })
      .on('error', (err) => {
        reject('Error reading CSV file:' + err)
      })
  })
}

export default async function getNormalizedDataFromUploadedFile(file) {
  const isCSV = file.originalname.toLowerCase().endsWith('.csv')
  const isExcel = ['.xls', '.xlsx'].some(ext => file.originalname.toLowerCase().endsWith(ext))
  if (isExcel) {
    return getExcelData(file)
  }
  if (isCSV) {
    await getCSVData(file).then(data => {
      return data
    }).catch(err => {
      throw new Error(err)
    })
  }
  if(!isExcel && !isCSV) {
    throw new Error('Unsupported file format. Please upload a CSV or Excel file')
  }
}