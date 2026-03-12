import {
  sessionStorageKey,
  updatedStoreEvent
} from './globals.js'

const template = document.createElement('template')
template.innerHTML = `
  <style>
    .bullet {
      border: 1px solid var(--darker-gray);
      background-color: var(--light-gray);
      border-radius: var(--border-radius-small);
      width: 100%;
      box-sizing: border-box;
      margin: var(--main-padding) 0;
      &.active {
        border: 1px solid var(--brown);
        footer {
          background-color: var(--brown);
        }
        #toggle {
          background: var(--brown);
          border-color: var(--white);
        }
      }
    }
    .head {
      padding: var(--main-padding) var(--main-padding) var(--x-large-space) var(--main-padding);
      font-weight: 500;
      color: var(--darker-gray);
      position:relative;
      text-transform: uppercase;
    }
    .name {
      padding: 0 var(--main-padding);
      font-style: italic;
      font-family: monospace;
      word-wrap: break-word;
    }
    .value {
      padding: var(--x-small-space) var(--main-padding);
      font-size: var(--font-size-bigger);
      font-weight: bold;
    }
    .lastmod {
      padding: var(--x-small-space) var(--main-padding);
      font-size: var(--font-size-x-small);
      color: var(--dark-gray);
    }
    footer {
      background-color: var(--darkest-gray);
      padding: var(--x-small-space);
    }
    #remove, #toggle {
      position: absolute;
      top: var(--main-padding);
      right: var(--main-padding);
      cursor: pointer;
      display: block;
      width: 16px;
      height: 16px;
    }
    #remove {
      font-size: 36px;
      line-height: 10px;
    }
    #toggle {
      right: calc(var(--main-padding) * 3);
      background-color: var(--white);
      border: 1px solid var(--dark-gray);
      box-sizing: border-box;
    }
  </style>

  <div class="bullet">
    <header class="head">
      <slot name="type"></slot>
      <span id="toggle" title="Select"></span>
      <span id="remove" title="Remove">&#215;</span>
    </header>
    <div class="name">
      <slot name="name"></slot>
    </div>
    <div class="value">
      <slot name="value"></slot>
    </div>
    <div class="lastmod">
      <slot name="lastmod"></slot>
    </div>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
`

class CmpBullet extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.shadow.append(template.content.cloneNode(true))
    this.root = this.shadow.querySelector('div')
    this.root.querySelector('#remove').addEventListener('click', () => {
      const storedTransactions = JSON.parse(sessionStorage.getItem(sessionStorageKey)) || []
      const updatedTransactions = storedTransactions.filter(t => t.id !== this.getAttribute('id'))
      sessionStorage.setItem(sessionStorageKey, JSON.stringify(updatedTransactions))
      const event = new Event(updatedStoreEvent)
      window.dispatchEvent(event)
      this.remove()
    })
    this.root.querySelector('#toggle').addEventListener('click', () => {
      const storedTransactions = JSON.parse(sessionStorage.getItem(sessionStorageKey)) || []
      storedTransactions.map(t => {
        if(t.id === this.getAttribute('id')) {
          t.active = !t.active
        }
      })
      sessionStorage.setItem(sessionStorageKey, JSON.stringify(storedTransactions))
      const event = new Event(updatedStoreEvent)
      window.dispatchEvent(event)
    })
  }

  connectedCallback() {
    this.root.classList.add(this.getAttribute('status'))
  }
}

customElements.define('cmp-bullet', CmpBullet)
