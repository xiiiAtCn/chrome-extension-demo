let changeColor = document.getElementById('changeColor')
changeColor.onclick = executeScript

let download = document.getElementById('download')
download.addEventListener('click', () => {
    urlList = urlList.filter(e => e.filename !== '' && e.host !== '')
    urlList.forEach(e => {
        e.src = `${e.protocol}://${e.host}/${e.path}`
        let url = `.${(e.type ? '/' + e.type :'')}/${e.filename}`
        if (e.attributeType === 'src') {
            e.reference.src = url
        } else if (e.attributeType=== 'href') {
            e.reference.href = url
        } else {
            e.reference.setAttribute(e.type, url)
        }
        downloadFile(e, pathPrefix)
    })
    let index = `<html>${doc.innerHTML}</html>`
    let blob = new Blob([index], {type: 'text/html'})
    index = URL.createObjectURL(blob)
    downloadFile({src: index, filename: `index.html`}, pathPrefix)
})

let linkList = []
let pathPrefix = './demo'

function downloadFile(fileObject, pathPrefix) {
    let url = `${(pathPrefix || '') + (fileObject.type ? '/' +fileObject.type :'')}/${fileObject.filename}`
    chrome.downloads.download({ url: fileObject.src, filename: url }, function(id) {
        console.log(id)
        console.log(url)
    })
}

let doc = ''
let urlList = []
chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action === 'getSource') {
        doc = request.source
        doc = doc.replace(/\s{2}/g, '')
        urlList = []
        doc = collect(doc, urlList)
        console.log(urlList)
    }
})

function executeScript () {
    console.log('click button')
    chrome.tabs.executeScript(null, {
        file: 'getPageSource.js'
    }, function () {
        if (chrome.runtime.lastError) {
            message = `There was an error injecting script: ${chrome.runtime.lastError}`
        }
    })
}

function collect (domStr, urlList) {
    let base = chrome.runtime.getURL('')
    let doc = document.createElement('html')
    doc.innerHTML = domStr
    let queue = []
    let target = doc

    while(target) {
        splitUrl(target, base).forEach(e => urlList.push(e))
        queue = [].concat.apply(queue, target.children)
        target = queue.shift()
    }
    return doc
}
