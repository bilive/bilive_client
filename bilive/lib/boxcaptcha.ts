import * as jpeg from 'jpeg-js'

let rawWidth = 480, rawImageData: Uint8Array
/**
 * 验证码识别
 * 
 * @export
 * @param {Buffer} jpegData
 * @returns {number}
 */
export function DeCaptcha(jpegData: Buffer): number {
  // 读取像素信息
  rawImageData = jpeg.decode(jpegData, true).data
  // 因为图片大小固定, 直接给定值
  let width = 120, height = 40, baseX = 0, baseY = 0
  // 逐行扫描
  for (let y = 0; y < height; y++) {
    // 计算第y行有效像素个数
    let sum = 0
    for (let x = 0; x < width; x++) sum += ImageBin(x, y)
    if (sum > 3) {
      baseY = y
      break
    }
  }
  // 逐列扫描
  for (let x = 0; x < width; x++) {
    // 计算第x列有效像素个数
    let sum = 0
    for (let y = 0; y < height; y++) sum += ImageBin(x, y)
    if (sum > 3) {
      baseX = x
      break
    }
  }
  if (baseX === 0 || baseY === 0) return -1
  // 用来存储结果, id为位置
  let id = 0, num: number[] = []
  // 逐列扫描
  for (let x = baseX; x < width; x++) {
    // 计算第x列有效像素个数
    let sum = 0
    for (let y = baseY; y < height; y++) sum += ImageBin(x, y)
    // 像素个数大于3判断为有效列
    if (sum > 3) {
      // 逐个分析此列像素信息
      for (let y = baseY; y < height; y++) {
        // 分析第一个有效像素位置
        if (ImageBin(x, y) === 1) {
          // 可能数字0, 2, 3, 5, 6, 7, 8, 9
          if (y < baseY + 3) {
            // 此列第12行有像素则可能数字0, 5, 6, 9
            if (ImageBin(x, baseY + 12, true) === 1) {
              // 右移12列第5行有像素则可能数字0, 6, 9
              if (ImageBin(x + 12, baseY + 5, true) === 1) {
                // 此列第19行有像素则可能数字0, 6
                if (ImageBin(x, baseY + 19, true) === 1) {
                  // 右移16列第14行有像素则可能数字6
                  if (ImageBin(x + 6, baseY + 14, true) === 1) {
                    num[id] = 6
                    id++
                    x += 15
                    break
                  }
                  else {
                    num[id] = 0
                    id++
                    x += 15
                    break
                  }
                }
                else {
                  num[id] = 9
                  id++
                  x += 15
                  break
                }
              }
              else {
                num[id] = 5
                id++
                x += 15
                break
              }
            }
            else {
              // 此列第28行有像素则可能数字2, 3, 8
              if (ImageBin(x, baseY + 28, true) === 1) {
                // 右移12列第23行有像素则可能数字3, 8
                if (ImageBin(x + 12, baseY + 23, true) === 1) {
                  // 此列第18行有像素则可能数字8
                  if (ImageBin(x, baseY + 18, true) === 1) {
                    num[id] = 8
                    id++
                    x += 15
                    break
                  }
                  else {
                    num[id] = 3
                    id++
                    x += 15
                    break
                  }
                }
                else {
                  num[id] = 2
                  id++
                  x += 15
                  break
                }
              }
              else {
                num[id] = 7
                id++
                x += 15
                break
              }
            }
          }
          // 可能数字1
          else if (y < baseY + 10) {
            num[id] = 1
            id++
            x += 6
            break
          }
          // 可能运算符'+', '-'
          else if (y < baseY + 18) {
            // 右移6列第12行有像素则可能运算符'+'
            if (ImageBin(x + 6, baseY + 12, true) === 1) {
              num[id] = 101 // +
              id++
              x += 16
              break
            }
            else {
              num[id] = 102 // -
              id++
              x += 8
              break
            }
          }
          else {
            num[id] = 4
            id++
            x += 16
            break
          }
        }
      }
    }
  }
  // 最后结果为四位则可能正确
  if (num.length === 4) {
    let captcha: number = num[2] === 101 ? num[0] * 10 + num[1] + num[3] : num[0] * 10 + num[1] - num[3]
    return captcha
  }
  else return -1
}
/**
 * 二值化
 * 
 * @param {number} x
 * @param {number} y
 * @param {boolean} [block=false]
 * @returns {number}
 */
function ImageBin(x: number, y: number, block = false): number {
  if (block) {
    let sum = ImageBin(x, y) + ImageBin(x + 1, y) + ImageBin(x, y + 1) + ImageBin(x + 1, y + 1)
    return sum > 2 ? 1 : 0
  }
  else return (rawImageData[x * 4 + y * rawWidth] * 3 + rawImageData[x * 4 + 1 + y * rawWidth] * 6 + rawImageData[x * 4 + 2 + y * rawWidth]) < 1280 ? 1 : 0
}