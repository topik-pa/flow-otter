import {
  createComponent,
  sessionStorageKey,
  updatedStoreEvent
} from '../../../../scripts/globals.js'

const $root = document.getElementById('column')

const manageCollapsableMenu = () => {
  if (!$root) return
  const $collapse = $root.querySelector('#collapse')
  if (!$collapse) return
  $collapse.addEventListener('click', () => {
    $root.classList.toggle('collapsed')
  })
}

const dropFileMngmt = () => {
  const $dropArea = document.getElementById('drop')
  const $fileInput = document.getElementById('transactions-input')
  const $fileName = document.getElementById('file-name')
  const $uploadBtn = document.getElementById('upload-transactions')

  function updateFileName(file) {
    if (file) {
      $fileName.textContent = file.name
      $uploadBtn.classList.remove('disabled')
    }
  }

  if (!$dropArea) return

  // Click per aprire file picker
  $dropArea.addEventListener('click', () => $fileInput.click())

  // File selezionato via click
  $fileInput.addEventListener('change', () => {
    updateFileName($fileInput.files[0])
  })

  // Drag over → serve per permettere il drop
  $dropArea.addEventListener('dragover', (e) => {
    e.preventDefault()
    $dropArea.classList.add('dragover')
  })

  // Drag leave → ritorna allo stato normale
  $dropArea.addEventListener('dragleave', () => {
    $dropArea.classList.remove('dragover')
  })

  // Drop del file
  $dropArea.addEventListener('drop', (e) => {
    e.preventDefault()
    $dropArea.classList.remove('dragover')

    const file = e.dataTransfer.files[0]
    $fileInput.files = e.dataTransfer.files // collega al file input

    updateFileName(file)
  })

  
}

const uploadFileMngmt = () => {
  const storeTransactions = (data) => {
    const storedTransactions = JSON.parse(sessionStorage.getItem(sessionStorageKey)) || []
    storedTransactions.push(data)
    sessionStorage.setItem(sessionStorageKey, JSON.stringify(storedTransactions))
    window.dispatchEvent(new Event(updatedStoreEvent))
  }

  const $uploadForm = document.getElementById('transactions-upload')
  if (!$uploadForm) return
  $uploadForm.addEventListener('submit', async(e) => {
    e.preventDefault()
    const fileInput = document.getElementById('transactions-input')
    if (fileInput.files.length === 0) {
      alert('Please select a file to upload.')
      return
    }

    const file = fileInput.files[0]
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await fetch('/transactions-upload', {
        method: 'POST',
        body: formData
      })
      const jsonResponse = await response.json()
      if(jsonResponse.error) {
        alert(jsonResponse.error)
      } else {
        storeTransactions(jsonResponse)
        // alert('File uploaded successfully! Check console for parsed data.')
      }
    } catch (error) {
      throw new Error(error)
    }
  })
}

const manageUploadedFilesList = () => {
  const storedTransactions = JSON.parse(sessionStorage.getItem(sessionStorageKey)) || []
  const $loadedFiles = document.getElementById('loaded-files')
  const $noFiles = document.getElementById('no-files')

  if (!$loadedFiles || !$noFiles) return

  if(storedTransactions.length === 0) {
    $loadedFiles.innerHTML = ''
    $noFiles.classList.remove('hide')
    return
  }
  $noFiles.classList.add('hide')

  $loadedFiles.innerHTML = ''

  for(const file of storedTransactions) {
    const date = new Date(file.date)
    const dateOptions = {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }
    const formattedDate = date.toLocaleString('en-GB', dateOptions)
    const bullet = createComponent('cmp-bullet', {
      status: file.active ? 'active' : 'inactive',
      id: file.id
    }, [
      createComponent('span', { slot: 'type' }, [file.format]),
      createComponent('span', { slot: 'name' }, [file.origin]),
      createComponent('span', { slot: 'value' }, [file.exchange]),
      createComponent('span', { slot: 'lastmod' }, [formattedDate]),
      createComponent('span', { slot: 'footer' }, [])
    ])
    $loadedFiles.appendChild(bullet)
  }
}



const column = {
  init: () => {
    manageCollapsableMenu()
    dropFileMngmt()
    uploadFileMngmt()

    manageUploadedFilesList()
    window.addEventListener(updatedStoreEvent, () => {
      manageUploadedFilesList()
    })
  }
}

export default column
