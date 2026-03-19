const cookieLayer = {
  init: () => {
    const cookieName = 'flow-otter.com-privacy'
    const cookieDuration = 120
    const cookieLayerWait = 3000

    const cookieAgreeBtn = document.querySelector('#cookie_layer_accept')
    const cookieLayerElement = document.querySelector('#cookie_layer')

    function getCookie(cname) {
      const name = cname + '='
      const ca = document.cookie.split(';')
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') {
          c = c.substring(1)
        }
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length)
        }
      }
      return ''
    };
    function setCookie(cname, cvalue, exdays) {
      const d = new Date()
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
      const expires = 'expires=' + d.toUTCString()
      document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
    }

    if (getCookie(cookieName) === '') {
      setTimeout(() => {
        cookieLayerElement.classList.add('active')
      }, cookieLayerWait)
    }

    cookieAgreeBtn.addEventListener('click', (e) => {
      e.preventDefault()
      setCookie(cookieName, 'true', cookieDuration)
      cookieLayerElement.classList.remove('active')
    })
  }
}

export default cookieLayer
