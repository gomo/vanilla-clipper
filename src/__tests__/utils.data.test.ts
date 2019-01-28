import CleanCSS from 'clean-css'
import { readFileSync } from 'fs-extra'
import { dataListToScriptString, dataSourceURLsToDataList, extractOrFetchCSS } from '../utils/data'
import { publicFilePath, servedFileURL } from './utils'

const cleanCSS = new CleanCSS()
const minify = (text: string) => cleanCSS.minify(text).styles

const iconURL = servedFileURL('icon.png')
const cssURL = servedFileURL('main.css')
const iconBuffer = readFileSync(publicFilePath('icon.png'))
const iconDataURL = `data:image/png;base64,${iconBuffer.toString('base64')}`
const cssFileText = readFileSync(publicFilePath('main.css'), 'utf8')

test('extractOrFetchCSSText()', async () => {
    const text = '.text { opacity: 1; }'
    const sheets = await extractOrFetchCSS([
        { type: 'text', url: servedFileURL(''), text },
        { type: 'link', url: cssURL },
    ])

    expect(sheets).toEqual([minify(text), minify(cssFileText).replace('/icon.png', iconURL)])
})

test('dataSourceUrlsToDataList', async () => {
    const dataList = await dataSourceURLsToDataList([new Set([iconURL])], servedFileURL('page'))

    expect(dataList).toEqual([[iconURL, iconDataURL]])
})

test('dataListToScriptString', () => {
    const script = dataListToScriptString([[iconURL, iconDataURL]], [cssFileText])

    expect(script).toMatch(`const dataList = [["${iconURL}","${iconDataURL}"]]`)
    expect(script).toMatch(`const cssTexts = [${JSON.stringify(cssFileText)}]`)
})
