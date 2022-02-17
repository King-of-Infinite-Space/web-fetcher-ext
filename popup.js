import { postToNotion } from "./sender/notionDb.js"

const _status = document.getElementById('status')
const _button = document.getElementById('submitButton')
const _inputBox = document.getElementById('inputBox')

window.onload = () => {
    getData()
}

function prettifyJson(json, indent = 2, level = 2) {
    let s = JSON.stringify(json, null, indent)
    s = s.replace(new RegExp(`\n[ ]{${(level + 1) * indent},}`, 'g'), '')
    s = s.replace(new RegExp(`\n[ ]{${level * indent}}([}\\]],?)`, 'g'), '$1')
    return s
}

async function postData(data, destination) {
    const send = {
        notion: postToNotion,
    }
    const r = await send[destination](data)

    _status.innerText = prettifyJson(r)
    _status.style.display = 'block'
    if (r.success) {
        _status.classList.add('success')
    } else {
        _status.classList.add('error')
    }
}

async function getData() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    chrome.tabs.sendMessage(tabs[0].id, { source: "popup" }, function (response) {
        if (response) {
            _inputBox.value = prettifyJson(response.payload)
            _inputBox.style.display = 'block'
            _status.innerText = ''
            _button.style.display = 'block'
            _button.onclick = () => {
                _status.classList.remove('error')
                _status.classList.remove('success')
                postData(_inputBox.value, response.destination)
            }
        } else {
            document.getElementById('status').innerText = 'no data'
        }
    });
}