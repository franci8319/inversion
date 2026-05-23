import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { readFileSync, writeFileSync } from 'fs'

GlobalWorkerOptions.workerSrc = new URL('./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).href

const buf = readFileSync('Reporte de Transcripciones Literales.pdf')
const pdf = await getDocument({ data: new Uint8Array(buf) }).promise
console.log('Páginas:', pdf.numPages)

let fullText = ''
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i)
  const content = await page.getTextContent()
  const text = content.items.map(item => item.str).join(' ')
  fullText += text + '\n'
}
writeFileSync('transcripciones.txt', fullText, 'utf8')
console.log('Primeros 2000 chars:')
console.log(fullText.substring(0, 2000))
