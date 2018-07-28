/**
 * 
 * @param {*} dom 
 * 可能出现url的属性
 * data-*: 自定义属性
 * a标签: href  tagName: A
 * link标签: href tagName: LINK
 * img标签: src tagName: IMG
 */
function splitUrl(dom, base) {
    // a标签 link标签
    let urlList = []
    if (dom.tagName === 'A' || dom.tagName === 'LINK') {
        if (dom.href !== '') {
            urlList.push(resolveUrl(dom, 'href', dom.href, base))
        }
    }

    // img标签 script标签
    if (dom.tagName === 'IMG' || dom.tagName === 'SCRIPT') {
        if (dom.src != '') {
            urlList.push(resolveUrl(dom, 'src',dom.src, base))
        }
    }

    // 暂时只处理带协议的url
    for ( let key in dom.dataset) {
        let value = dom.getAttribute(`data-${key}`)
        if (value && isUrl(value)) {
            urlList.push(resolveUrl(dom, `data-${key}`,value, value))
        }
    }

    return urlList
}

function isUrl (str) {
    if (str.startsWith('https') || str.startsWith('http')) {
        return true
    } 
    return false
}


function resolveUrl (reference, attributeType, str, base) {
    let url = {
        protocol: '',
        host: '',
        path: '',
        queries: '',
        hash: '',
        attributeType: attributeType,
        reference: reference,
        type: '',
        filename: ''
    }

    // 移除插件影响
    if (str.startsWith(base)) {
        str = str.match(/.*\/\/[^\/]*(\/.*)/)[1]
    }
    if (str.startsWith('chrome')) {
        str = str.match(/(.*)\/\/(.*)/)[2]
    }

    if (str.startsWith('https')) {
        url.protocol = 'https'
        str = str.slice(8)
    } else if (str.startsWith('http')) {
        url.protocol = 'http'
        str = str.slice(7)
    } else if (str.startsWith('//')) {
        str = str.slice(2)
    }
    //# ? /
    let hash = str.split('#')
    if (hash.length === 2) {
        url.hash = hash[1]
    }
    let queries = hash[0].split('?')
    if (queries.length === 2 && queries[1] !== '') {
        queries[1].split('&').map(e => {
            let tmp = e.split('=')
            if (e === '') {
                return {
                }
            }
            return {
                [tmp[0]]: tmp[1]
            }
        }).forEach(e => {
            url.queries = {
                ...url.queries,
                ...e
            }
        })
    }
    let path = queries[0].split('/')
    if (path[0] !== '.' && 
        path[0] !== '..' && 
        !path[0].endsWith('.') && 
        path[0].indexOf('.') !== -1) {
            url.host = path[0]
    }
    url.path = path.slice(1).join('/')
    //css js png jpeg  暂未支持二进制流文件
    let src = url.path
    if (src.lastIndexOf('.') !== -1 && src.lastIndexOf('/') < src.lastIndexOf('.')) {
        url.filename = src.slice(src.lastIndexOf('/') + 1)
        url.type = src.slice(src.lastIndexOf('.') + 1)
    }
    return url

}
