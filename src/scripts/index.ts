const samples = [
  'images/sample1.jpg',
  'images/sample2.jpg',
  'images/sample3.jpg',
  'images/sample4.jpg',
  'images/sample5.jpg',
]
const sample = randomFrom(samples)
const config: Config = {
  text: 'Please wash your hands',
  fontSize: 20,
  marginRight: 11,
  marginBottom: 5,
  downloadName: 'fonto.jpg',
  width: 1500,
  image: null,
  container: document.querySelector('.canvas-container'),
}
const uploadButton = document.querySelector('input#upload')
uploadButton.addEventListener('change', loadFile)
setupControls()
loadImage(sample).then(img => {
  config.image = img
  config.downloadName = 'fonto.jpg'
  editImage(config)
})
const container = document.querySelector('.canvas-container')

// FUNCTIONS
function editImage(config: Config) {
  const { image, container } = config
  if (!image) return
  const canvas = document.createElement('canvas')
  const size = setCanvasSize(image, canvas, config.width)
  const textData = processText(config.text, size, config)
  const imgData = processImage(Float32Array.from(textData.data), image, size)

  const ctx = canvas.getContext('2d')
  ctx.putImageData(imgData, 0, 0)

  // set download link
  const downloadButton = document.querySelector(
    'a#download-button',
  ) as HTMLAnchorElement
  downloadButton.download = config.downloadName
  downloadButton.href = canvas.toDataURL()

  removeNodes(container)
  container.appendChild(canvas)
}
function setupControls() {
  const controls = document.querySelectorAll(
    '.controls input, .controls textarea',
  ) as NodeListOf<HTMLInputElement>
  controls.forEach(control => {
    if (!(control.name in config)) return
    control.value = (config as any)[control.name]
    control.addEventListener('change', e => {
      const target = e.target as HTMLInputElement
      const value =
        target.type === 'number' || target.type === 'range'
          ? Number(target.value)
          : target.value
      ;(config as any)[target.name] = value
      editImage(config)
    })
  })
}
function loadFile(event: HTMLInputEvent): void {
  const file = event.target.files[0]
  const reader = new FileReader()
  reader.onloadend = async () => {
    config.image = await loadImage(reader.result as string)
    config.downloadName = generateName(file.name)
    editImage(config)
  }
  if (file) reader.readAsDataURL(file)
}
function loadImage(imgURL: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    const image = new Image()
    image.src = imgURL
    image.onload = () => resolve(image)
  })
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
  const { data } = imgData
  for (let i = 0; i < imgData.data.length; i += 4) {
    const r = data[i + 0]
    const g = data[i + 1]
    const b = data[i + 2]
    const gray = 0.2 * r + 0.72 * g + 0.07 * b
    if (
      (textData[i + 0] === 0 &&
        textData[i + 1] === 0 &&
        textData[i + 2] === 0) ||
      gray < 20
    ) {
      data[i + 0] = 0
      data[i + 1] = 0
      data[i + 2] = 0
    } else {
      data[i + 0] = gray
      data[i + 1] = gray
      data[i + 2] = gray
    }
  }

  return imgData
}
function setCanvasSize(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  width = 1500,
): Size {
  const aspect = image.width / image.height

  const height = width / aspect
  canvas.style.width = '100%'
  canvas.width = width
  canvas.height = height

  return { width, height }
}
function generateName(name: string): string {
  const arr = name.split('.')
  arr.pop()
  return [...arr, '_fonto.jpg'].join('')
}
// utils
function removeNodes(parent: Element): number {
  const count = parent.children.length
  Array.from(parent.children).forEach(child => {
    parent.removeChild(child)
  })
  return count
}
function randomFrom<T>(array: T[]): T {
  const random = Math.floor(Math.random() * array.length)
  return array[random]
}
interface Size {
  width: number
  height: number
}
interface Config {
  fontSize: number
  marginRight: number
  marginBottom: number
  text: string
  downloadName: string
  width: number
  image: HTMLImageElement
  container: Element
}
interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}
