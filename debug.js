const body = document.body

const span = body.appendChild(document.createElement('span'))
const { style } = span

style.cssText = 'position:fixed;margin:0;padding:0;width:1px;background:red;z-index:2147483647;'

document.addEventListener('keyup', e => {
  const nodeName = e.target.nodeName.toLowerCase()

  if (nodeName === 'input' || nodeName === 'textarea') {
    const xy = caretXY(e.target)

    style.top = xy.top + 'px'
    style.left = xy.left + 'px'
    style.height = xy.height + 'px'

    body.appendChild(span)
  }
})