const $root = document.getElementById('column')

const manageCollapsableMenu = () => {
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
  const $uploadForm = document.getElementById('transactions-upload')
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
      console.log(await response.json())
    } catch (error) {
      throw new Error(error)
    }
  })
}

const column = {
  init: () => {
    manageCollapsableMenu()
    dropFileMngmt()
    uploadFileMngmt()
  }
}

export default column
