let changeColor = document.getElementById('changeColor')
changeColor.onclick = function(e) {
    let color = e.target.value
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        console.log('come here', tabs)
        chrome.tabs.executeScript(
            tabs[0].id,
            {
                code: 'document.body.style.backgroundColor = "red";'
            }
        );
    });
};