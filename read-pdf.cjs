const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')
const fs = require('fs')

async function main() {
  const buf = fs.readFileSync('Reporte de Transcripciones Literales.pdf')
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise
  console.log('Páginas:', pdf.numPages)

  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map(item => item.str).join(' ')
    fullText += text + '\n'
  }
  fs.writeFileSync('transcripciones.txt', fullText, 'utf8')
  console.log('Guardado en transcripciones.txt')
  console.log('Primeros 1000 chars:')
  console.log(fullText.substring(0, 1000))
}

main().catch(console.error)
