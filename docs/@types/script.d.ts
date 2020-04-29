interface modalOPtions {
  body: string | DocumentFragment
  title?: string
  close?: string
  ok?: string
  showOK?: boolean
  onOK?: (body: this['body']) => void
  onClose?: (body: this['body']) => void
}