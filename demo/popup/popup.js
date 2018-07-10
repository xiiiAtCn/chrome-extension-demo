let changeColor = document.getElementById('changeColor')
changeColor.onclick = executeScript

let download = document.getElementById('download')
download.onclick = downloadFile

let url = []

let linkList = []

function downloadFile() {
    chrome.downloads.download({url: url[0].src}, function(id) {
        console.log(id)
    })
}

let message = ''
chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action === 'getSource') {
        message = request.source
        message = message.replace(/\s{2}/g, '')
        let blob = new Blob([message], {type: 'text/html'})
        let a = document.createElement('a')
        let urlList = collect(message)
        console.log(urlList)
        a.src = URL.createObjectURL(blob)
        url.push(a)
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

function collect (domStr) {
    let base = chrome.runtime.getURL('')
    let doc = document.createElement('html')
    doc.innerHTML = domStr
    let urlList = []
    let queue = []
    let target = doc

    while(target) {
        urlList = urlList.concat(splitUrl(target, base));
        queue = [].concat.apply(queue, target.children)
        target = queue.shift()
    }
    return urlList
}
