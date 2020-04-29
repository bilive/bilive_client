"use strict";
class ECDH {
    constructor(curve_name) {
        this.privateKey = 0n;
        this.publicKey = { x: 0n, y: 0n };
        this.zero = { x: 0n, y: 0n };
        if (ECDH.curve[curve_name] !== undefined)
            this.curve = ECDH.curve[curve_name];
        else
            throw 'curve_name error';
    }
    static randomBytes(length) {
        const random = window.crypto.getRandomValues(new Uint8Array(length));
        return ECDH.buf2hex(random);
    }
    static hex2buf(hex) {
        return new Uint8Array(hex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    }
    static buf2hex(buf) {
        return [...buf].map(b => b.toString(16).padStart(2, '0')).join('');
    }
    static point2hex(point) {
        return `04${point.x.toString(16).padStart(132, '0')}${point.y.toString(16).padStart(132, '0')}`;
    }
    static hex2point(point) {
        const x = BigInt(`0x${point.slice(2, (point.length + 2) / 2)}`);
        const y = BigInt(`0x${point.slice((point.length + 2) / 2)}`);
        return { x, y };
    }
    static createECDH(curve_name) {
        return new ECDH(curve_name);
    }
    generateKeys() {
        const { private_key, public_key } = this.make_keypair();
        this.privateKey = private_key;
        this.publicKey = public_key;
    }
    getPublicKey() {
        return ECDH.point2hex(this.publicKey);
    }
    computeSecret(bobPublicKey) {
        const sharedSecret = this.scalar_mult(this.privateKey, ECDH.hex2point(bobPublicKey));
        const sharedSecretKey = ECDH.point2hex(sharedSecret);
        return sharedSecretKey.slice(2, (sharedSecretKey.length - 2) / 2);
    }
    eq({ x: x1, y: y1 }, { x: x2, y: y2 }) {
        return x1 === x2 && y1 === y2;
    }
    mod(m, n) {
        return ((m % n) + n) % n;
    }
    inverse_mod(k, p) {
        if (k === 0n)
            throw 'division by zero';
        if (k < 0n)
            return p - this.inverse_mod(-k, p);
        let [s, oldS] = [0n, 1n];
        let [t, oldT] = [1n, 0n];
        let [r, oldR] = [p, k];
        while (r !== 0n) {
            const quotient = oldR / r;
            [oldR, r] = [r, oldR - quotient * r];
            [oldS, s] = [s, oldS - quotient * s];
            [oldT, t] = [t, oldT - quotient * t];
        }
        return this.mod(oldS, p);
    }
    is_on_curve(point) {
        if (this.eq(point, this.zero))
            return true;
        let { x, y } = point;
        return this.mod(y ** 2n - x ** 3n - this.curve.a * x - this.curve.b, this.curve.p) === 0n;
    }
    point_neg(point) {
        if (this.eq(point, this.zero))
            return this.zero;
        const { x, y } = point;
        const result = { x, y: this.mod(-y, this.curve.p) };
        return result;
    }
    point_add(point1, point2) {
        if (this.eq(point1, this.zero))
            return point2;
        if (this.eq(point2, this.zero))
            return point1;
        const { x: x1, y: y1 } = point1;
        const { x: x2, y: y2 } = point2;
        if (x1 === x2 && y1 !== y2)
            return this.zero;
        let m;
        if (x1 === x2)
            m = (3n * x1 ** 2n + this.curve.a) * this.inverse_mod(2n * y1, this.curve.p);
        else
            m = (y1 - y2) * this.inverse_mod(x1 - x2, this.curve.p);
        const x3 = m ** 2n - x1 - x2;
        const y3 = y1 + m * (x3 - x1);
        const result = { x: this.mod(x3, this.curve.p), y: this.mod(-y3, this.curve.p) };
        return result;
    }
    scalar_mult(k, point) {
        if (this.mod(k, this.curve.n) === 0n || this.eq(point, this.zero))
            return this.zero;
        if (k < 0n)
            return this.scalar_mult(-k, this.point_neg(point));
        let result = this.zero;
        let addend = point;
        while (k) {
            if (k & 1n)
                result = this.point_add(result, addend);
            addend = this.point_add(addend, addend);
            k >>= 1n;
        }
        return result;
    }
    make_keypair() {
        const private_key = BigInt(`0x${ECDH.randomBytes(66)}`);
        const public_key = this.scalar_mult(private_key, this.curve.g);
        return { private_key, public_key };
    }
}
ECDH.curve = {
    secp521r1: {
        p: 0x01ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn,
        a: 0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffcn,
        b: 0x0051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00n,
        g: {
            x: 0x00c6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66n,
            y: 0x011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650n,
            toString: () => '0400C6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66011839296A789A3BC0045C8A5FB42C7D1BD998F54449579B446817AFBD17273E662C97EE72995EF42640C550B9013FAD0761353C7086A272C24088BE94769FD16650'
        },
        n: 0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409n,
        h: 1n
    }
};
