"use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
var root = document.documentElement;
var body = document.body;
var remToPixelRatio;
function toPixels(value, contextElementFontSize) {
    var pixels = parseFloat(value);
    if (value.indexOf('pt') !== -1) {
        pixels = pixels * 4 / 3;
    }
    else if (value.indexOf('mm') !== -1) {
        pixels = pixels * 96 / 25.4;
    }
    else if (value.indexOf('cm') !== -1) {
        pixels = pixels * 96 / 2.54;
    }
    else if (value.indexOf('in') !== -1) {
        pixels *= 96;
    }
    else if (value.indexOf('pc') !== -1) {
        pixels *= 16;
    }
    else if (value.indexOf('rem') !== -1) {
        if (!remToPixelRatio) {
            remToPixelRatio = parseFloat(getComputedStyle(root).fontSize);
        }
        pixels *= remToPixelRatio;
    }
    else if (value.indexOf('em') !== -1) {
        pixels = contextElementFontSize ? pixels * parseFloat(contextElementFontSize) : toPixels(pixels + 'rem', contextElementFontSize);
    }
    return pixels;
}
function lineHeightInPixels(lineHeight, contextElementFontSize) {
    return lineHeight === 'normal' ? 1.2 * parseInt(contextElementFontSize, 10) : toPixels(lineHeight, contextElementFontSize);
}
var properties = [
    'direction',
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
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
    'textDecoration',
    'varterSpacing',
    'wordSpacing',
    'tabSize',
    'MozTabSize'
];
function caretXY(element, position) {
    if (position === void 0) { position = element.selectionEnd; }
    var nodeName = element.nodeName.toLowerCase();
    var isInput = nodeName === 'input';
    var div = document.createElement('div');
    div.id = 'input-textarea-caret-position-mirror-div' + (+new Date());
    document.body.appendChild(div);
    var style = div.style;
    var computed = getComputedStyle(element);
    style.whiteSpace = 'pre-wrap';
    if (!isInput)
        style.wordWrap = 'break-word';
    style.position = 'absolute';
    style.visibility = 'hidden';
    properties.forEach(function (prop) {
        style[prop] = computed[prop];
    });
    style.overflow = 'hidden';
    div.textContent = element.value.substring(0, position);
    if (isInput)
        div.textContent = div.textContent.replace(/\s/g, '\u00a0');
    var span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);

    const absolute = true
    var left = span.offsetLeft + parseInt(computed['borderLeftWidth']) - element.scrollLeft;
    var top = span.offsetTop + parseInt(computed['borderTopWidth']) - element.scrollTop;

    if (absolute) {
      var rect = element.getBoundingClientRect();
      left += rect.left
      top += rect.top
    } else {
      left += element.offsetLeft
      top += element.offsetTop
    }

    var coordinates = {
        top: top,
        left: left,
        height: lineHeightInPixels(computed.lineHeight, computed.fontSize)
    };
    body.removeChild(div);
    return coordinates;
}
// exports.default = caretXY;
if (!!localStorage.DEBUG_CARET_XY) {
    var span_1 = document.body.appendChild(document.createElement('span'));
    span_1.style.cssText = 'position: absolute; display: inline-block; margin: 0; padding: 0; height: 16px; width: 2px; background: red; z-index: 99999;';
    document.addEventListener('input', function (e) {
        var xy = caretXY(e.target);
        span_1.style.top = xy.top + 'px';
        span_1.style.left = xy.left + 'px';
        document.body.appendChild(span_1);
    });
}
//# sourceMappingURL=caret-xy.js.map