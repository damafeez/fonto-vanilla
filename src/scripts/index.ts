init()

// functions
async function init() {
  const sample = 'images/sample1.png'
  const text = 'Hello World is the long text'

  const canvas = document.createElement('canvas')
  const container = document.body
  const image = await loadImage(sample)
  const config = getDefaultConfig(image.width * image.height)
  const size = setCanvasSize(image, canvas)
  const textData = processText(text, size, config)
  const imgData = processImage(Float32Array.from(textData.data), image, size)

  const ctx = canvas.getContext('2d')
  ctx.putImageData(imgData, 0, 0)

  container.appendChild(canvas)
}
function loadImage(imgURL: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    const image = new Image()
    image.src = imgURL
    image.onload = () => resolve(image)
  })
}
function getDefaultConfig(resolution: number): Config {
  console.log(resolution)
  const fontSize = clamp(resolution / 5000, 15, 30)
  const marginRight = fontSize / 3
  const marginBottom = fontSize / 3
  return {
    fontSize,
    marginRight,
    marginBottom,
  }
}
function processText(text: string, size: Size, config: Config): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const ctx = canvas.getContext('2d')
  const { fontSize: tHeight, marginRight, marginBottom } = config

  ctx.font = `${tHeight}px sans-serif`

  // background
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  const { width: tWidth } = ctx.measureText(text)
  let distx = 0
  let disty = 0

  while (disty < canvas.height) {
    ctx.fillText(text, distx, disty)
    distx += tWidth + marginRight
    if (distx >= canvas.width) {
      disty += tHeight + marginBottom
      distx = Math.random() * -100
    }
  }

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

function processImage(
  textData: Float32Array,
  image: HTMLImageElement,
  size: Size,
): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height

  const ctx = canvas.getContext('2d')

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < imgData.data.length; i += 4) {
    const r = imgData.data[i + 0]
    const g = imgData.data[i + 1]
    const b = imgData.data[i + 2]
    const gray = 0.2 * r + 0.72 * g + 0.07 * b
    if (
      (textData[i + 0] === 0 &&
        textData[i + 1] === 0 &&
        textData[i + 2] === 0) ||
      gray < 20
    ) {
      imgData.data[i + 0] = imgData.data[i + 1] = imgData.data[i + 2] = 0
    } else {
      imgData.data[i + 0] = imgData.data[i + 1] = imgData.data[i + 2] = gray
    }
  }

  return imgData
}
function setCanvasSize(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
): Size {
  const width = 1500
  const aspect = image.width / image.height

  const height = width / aspect
  canvas.style.width = '100%'
  canvas.width = width
  canvas.height = height

  return { width, height }
}
function clamp(num: number, min: number, max: number): number {
  if (num < min) return min
  else if (num > max) return max
  return num
}
interface Size {
  width: number
  height: number
}
interface Config {
  fontSize: number
  marginRight: number
  marginBottom: number
}
