interface modalOPtions {
  body: string | DocumentFragment
  title?: string
  close?: string
  ok?: string
  showOK?: boolean
  onOK?: (body: this['body']) => void
  onClose?: (body: this['body']) => void
}
declare function qrcode(typeNumber: number, errorCorrectionLevel: string): {
  addData: (data: string, mode?: string) => void
  make: () => void
  createDataURL: (cellSize?: number, margin?: number) => string
}