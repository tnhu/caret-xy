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

function getMirrorInfo(element, isInput) {
  if (element.mirrorInfo) {
    return element.mirrorInfo
  }

  const div = body.appendChild(document.createElement('div'))
  const style = div.style
  const computedStyles = getComputedStyle(element)

  style.whiteSpace = 'pre-wrap'
  if (!isInput) style.wordWrap = 'break-word' // only for textarea

  style.position = 'absolute'
  style.visibility = 'hidden' // not 'display: none' because we want rendering

  properties.forEach(prop => style[prop] = computedStyles[prop])
  style.overflow = 'hidden' // Do we need to copy overflowX, overflowY if this is set?

  // Cache mirror info so we don't create elements and invoke getComputedStyle() again and again
  element.mirrorInfo = { div, span: document.createElement('span'), computedStyles }

  // Remove cached mirror div when element is out of focus
  element.addEventListener('focusout', function cleanup() {
    delete element.mirrorInfo
    body.removeChild(div)
    element.removeEventListener('focusout', cleanup)
  }
)

  return element.mirrorInfo
}

export default function caretXY(element, position = element.selectionEnd): CaretInfo {
  const isInput = element.nodeName.toLowerCase() === 'input'
  const { div, span, computedStyles } = getMirrorInfo(element, isInput)
  const content = element.value.substring(0, position)

  body.appendChild(div)

  // For input, text content needs to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
  div.textContent = isInput ? content.replace(/\s/g, '\u00a0') : content

  // Wrapping must be replicated *exactly*, including when a long word gets
  // onto the next line, with whitespace at the end of the line before (#7).
  // The  *only* reliable way to do that is to copy the *entire* rest of the
  // textarea's content into the <span> created at the caret position.
  // for inputs, just '.' would be enough, but why bother?
  span.textContent = element.value.substring(position) || '.' // || because a completely empty faux span doesn't render at all
  div.appendChild(span)

  const absolute = true
  let left = span.offsetLeft + parseInt(computedStyles['borderLeftWidth']) - element.scrollLeft
  let top = span.offsetTop + parseInt(computedStyles['borderTopWidth']) - element.scrollTop
  const height = lineHeightInPixels(computedStyles.lineHeight, computedStyles.fontSize)

  if (absolute) {
    var rect = element.getBoundingClientRect()
    left += rect.left
    top += rect.top
  } else {
    // TODO Test if this is necessary
    left += element.offsetLeft
    top += element.offsetTop
  }

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
