const root = document.documentElement
const body = document.body
let remToPixelRatio

export interface CaretInfo {
  top: number
  left: number
  height: number
}

function toPixels(value, contextElementFontSize) {
  var pixels = parseFloat(value)

  if (value.indexOf('pt') !== -1) {
    pixels = pixels * 4 / 3
  } else if (value.indexOf('mm') !== -1) {
    pixels = pixels * 96 / 25.4
  } else if (value.indexOf('cm') !== -1) {
    pixels = pixels * 96 / 2.54
  } else if (value.indexOf('in') !== -1) {
    pixels *= 96
  } else if (value.indexOf('pc') !== -1) {
    pixels *= 16
  } else if (value.indexOf('rem') !== -1) {
    if (!remToPixelRatio) {
      remToPixelRatio = parseFloat(getComputedStyle(root).fontSize)
    }
    pixels *= remToPixelRatio
  } else if (value.indexOf('em') !== -1) {
    pixels = contextElementFontSize ? pixels * parseFloat(contextElementFontSize) : toPixels(pixels + 'rem', contextElementFontSize)
  }

  return pixels
}

function lineHeightInPixels(lineHeight, contextElementFontSize) {
  return lineHeight === 'normal' ? 1.2 * parseInt(contextElementFontSize, 10) : toPixels(lineHeight, contextElementFontSize)
}

// Original source from `textarea-caret-position`
// https://github.com/component/textarea-caret-position
// MIT, Copyright (c) 2015 Jonathan Ong me@jongleberry.com

// The properties that we copy into a mirrored div.
// Note that some browsers, such as Firefox,
// do not concatenate properties, i.e. padding-top, bottom etc. -> padding,
// so we have to do every single property specifically.
const properties = [
  'direction', // RTL support
  'boxSizing',
  'width', // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
  'height',
  'overflowX',
  'overflowY', // copy the scrollbar for IE

  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',

  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',

  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',

  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration', // might not make a difference, but better be safe

  'varterSpacing',
  'wordSpacing',

  'tabSize',
  'MozTabSize'
]

export default function caretXY(element, position = element.selectionEnd): CaretInfo {
  const nodeName = element.nodeName.toLowerCase()
  const isInput = nodeName === 'input'

  // mirrored div
  var div = document.createElement('div')
  div.id = 'input-textarea-caret-position-mirror-div' + +new Date()
  body.appendChild(div)

  var style = div.style
  var computed = getComputedStyle(element)

  // default textarea styles
  style.whiteSpace = 'pre-wrap'
  if (!isInput) style.wordWrap = 'break-word' // only for textarea-s

  // position off-screen
  style.position = 'absolute' // required to return coordinates properly
  style.visibility = 'hidden' // not 'display: none' because we want rendering

  // transfer the element's properties to the div
  properties.forEach(function(prop) {
    style[prop] = computed[prop]
  })

  style.overflow = 'hidden'

  div.textContent = element.value.substring(0, position)
  // the second special handling for input type="text" vs textarea: spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
  if (isInput) div.textContent = div.textContent.replace(/\s/g, '\u00a0')

  var span = document.createElement('span')
  // Wrapping must be replicated *exactly*, including when a long word gets
  // onto the next line, with whitespace at the end of the line before (#7).
  // The  *only* reliable way to do that is to copy the *entire* rest of the
  // textarea's content into the <span> created at the caret position.
  // for inputs, just '.' would be enough, but why bother?
  span.textContent = element.value.substring(position) || '.' // || because a compvarely empty faux span doesn't render at all
  div.appendChild(span)

  const absolute = true
  let left = span.offsetLeft + parseInt(computed['borderLeftWidth']) - element.scrollLeft
  let top = span.offsetTop + parseInt(computed['borderTopWidth']) - element.scrollTop
  const height = lineHeightInPixels(computed.lineHeight, computed.fontSize)

  if (absolute) {
    var rect = element.getBoundingClientRect()
    left += rect.left
    top += rect.top
  } else {
    // TODO Test if this is necessary
    left += element.offsetLeft
    top += element.offsetTop
  }

  body.removeChild(div)

  return { top, left, height }
}

if (!!localStorage.DEBUG_CARET_XY) {
  const span = body.appendChild(document.createElement('span'))

  span.style.cssText =
    'position: absolute; display: inline-block; margin: 0; padding: 0; height: 16px; width: 1px; background: red; z-index: 99999;'

  document.addEventListener('input', e => {
    const xy = caretXY(e.target)

    span.style.top = xy.top + 'px'
    span.style.left = xy.left + 'px'
    span.style.height = xy.height + 'px'

    body.appendChild(span)
  })
}
