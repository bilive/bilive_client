interface point {
  x: bigint
  y: bigint
  toString?: () => string
}
interface curve {
  p: bigint
  a: bigint
  b: bigint
  g: point
  n: bigint
  h: bigint
}
