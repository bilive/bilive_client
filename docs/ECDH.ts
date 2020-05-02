/**
 * 算法来自 https://andrea.corbellini.name/2015/05/30/elliptic-curve-cryptography-ecdh-and-ecdsa/
 * MIT license
 */
class ECDH {
  private constructor(curve_name: string) {
    if (ECDH.curve[curve_name] !== undefined) this.curve = ECDH.curve[curve_name]
    else throw 'curve_name error'
  }
  public static curve: Record<string, curve> = {
    secp521r1: {
      p: 0x01FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn,
      a: 0x01FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFCn,
      b: 0x0051953EB9618E1C9A1F929A21A0B68540EEA2DA725B99B315F3B8B489918EF109E156193951EC7E937B1652C0BD3BB1BF073573DF883D2C34F1EF451FD46B503F00n,
      g: {
        x: 0x00C6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66n,
        y: 0x011839296A789A3BC0045C8A5FB42C7D1BD998F54449579B446817AFBD17273E662C97EE72995EF42640C550B9013FAD0761353C7086A272C24088BE94769FD16650n,
        toString: () => '0400C6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66011839296A789A3BC0045C8A5FB42C7D1BD998F54449579B446817AFBD17273E662C97EE72995EF42640C550B9013FAD0761353C7086A272C24088BE94769FD16650'
      },
      n: 0x01FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409n,
      h: 1n
    }
  }
  /**
   * 随机hex
   *
   * @static
   * @param {number} length
   * @returns {string}
   * @memberof ECDH
   */
  public static randomBytes(length: number): string {
    const random = window.crypto.getRandomValues(new Uint8Array(length))
    return ECDH.buf2hex(random)
  }
  /**
   * hex字符串转为Uint8Array
   *
   * @static
   * @param {string} hex
   * @returns {Uint8Array}
   * @memberof Options
   */
  public static hex2buf(hex: string): Uint8Array {
    // @ts-ignore 需要格式正确
    return new Uint8Array(hex.match(/.{2}/g).map(byte => parseInt(byte, 16)))
  }
  /**
   * Uint8Array转为hex字符串
   *
   * @static
   * @param {Uint8Array} buf
   * @returns {string}
   * @memberof Options
   */
  public static buf2hex(buf: Uint8Array): string {
    return [...buf].map(b => b.toString(16).padStart(2, '0')).join('')
  }
  public static point2hex(point: point): string {
    return `04${point.x.toString(16).padStart(132, '0')}${point.y.toString(16).padStart(132, '0')}`
  }
  public static hex2point(point: string): point {
    const x = BigInt(`0x${point.slice(2, (point.length + 2) / 2)}`)
    const y = BigInt(`0x${point.slice((point.length + 2) / 2)}`)
    return { x, y }
  }
  public static createECDH(curve_name: string): ECDH {
    return new ECDH(curve_name)
  }
  public generateKeys() {
    const { private_key, public_key } = this.make_keypair()
    this.privateKey = private_key
    this.publicKey = public_key
  }
  public getPublicKey(): string {
    return ECDH.point2hex(this.publicKey)
  }
  public computeSecret(bobPublicKey: string): string {
    const sharedSecret = this.scalar_mult(this.privateKey, ECDH.hex2point(bobPublicKey))
    const sharedSecretKey = ECDH.point2hex(sharedSecret)
    return sharedSecretKey.slice(2, (sharedSecretKey.length - 2) / 2)
  }
  private curve: curve
  private privateKey: bigint = 0n
  private publicKey: point = { x: 0n, y: 0n }
  private eq({ x: x1, y: y1 }: point, { x: x2, y: y2 }: point): boolean {
    return x1 === x2 && y1 === y2
  }
  private mod(m: bigint, n: bigint): bigint {
    return ((m % n) + n) % n
  }
  private zero: point = { x: 0n, y: 0n }
  private inverse_mod(k: bigint, p: bigint): bigint {
    if (k === 0n) throw 'division by zero'
    if (k < 0n) return p - this.inverse_mod(-k, p)

    let [s, oldS] = [0n, 1n]
    let [t, oldT] = [1n, 0n]
    let [r, oldR] = [p, k]

    while (r !== 0n) {
      const quotient = oldR / r
        ;[oldR, r] = [r, oldR - quotient * r]
        ;[oldS, s] = [s, oldS - quotient * s]
        ;[oldT, t] = [t, oldT - quotient * t]
    }

    // const [gcd, x, y] = [oldR, oldS, oldT]

    return this.mod(oldS, p)
  }
  // @ts-ignore
  private is_on_curve(point: point) {
    if (this.eq(point, this.zero)) return true
    let { x, y } = point
    return this.mod(y ** 2n - x ** 3n - this.curve.a * x - this.curve.b, this.curve.p) === 0n
  }
  private point_neg(point: point): point {
    if (this.eq(point, this.zero)) return this.zero

    const { x, y } = point
    const result = { x, y: this.mod(-y, this.curve.p) }

    return result
  }
  private point_add(point1: point, point2: point): point {
    if (this.eq(point1, this.zero)) return point2
    if (this.eq(point2, this.zero)) return point1

    const { x: x1, y: y1 } = point1
    const { x: x2, y: y2 } = point2

    if (x1 === x2 && y1 !== y2) return this.zero

    let m
    if (x1 === x2)
      m = (3n * x1 ** 2n + this.curve.a) * this.inverse_mod(2n * y1, this.curve.p)
    else
      m = (y1 - y2) * this.inverse_mod(x1 - x2, this.curve.p)

    const x3 = m ** 2n - x1 - x2
    const y3 = y1 + m * (x3 - x1)

    const result = { x: this.mod(x3, this.curve.p), y: this.mod(-y3, this.curve.p) }

    return result
  }
  private scalar_mult(k: bigint, point: point): point {
    if (this.mod(k, this.curve.n) === 0n || this.eq(point, this.zero)) return this.zero
    if (k < 0n) return this.scalar_mult(-k, this.point_neg(point))

    let result = this.zero
    let addend = point

    while (k) {
      if (k & 1n) result = this.point_add(result, addend)
      addend = this.point_add(addend, addend)
      k >>= 1n
    }

    return result
  }
  private make_keypair(): { private_key: bigint, public_key: point } {
    const private_key = BigInt(`0x${ECDH.randomBytes(66)}`)
    const public_key = this.scalar_mult(private_key, this.curve.g)

    return { private_key, public_key }
  }
}