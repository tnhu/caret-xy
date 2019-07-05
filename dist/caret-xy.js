"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var root = document.documentElement;
var body = document.body;
var remToPixelRatio;
function toPixels(value, elementFontSize) {
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
        pixels = elementFontSize ? pixels * parseFloat(elementFontSize) : toPixels(pixels + 'rem', elementFontSize);
    }
    return pixels;
}
function lineHeightInPixels(lineHeight, elementFontSize) {
    return lineHeight === 'normal' ? 1.2 * parseInt(elementFontSize, 10) : toPixels(lineHeight, elementFontSize);
}
var mirrorAttributes = [
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
function getMirrorInfo(element, isInput) {
    if (element.mirrorInfo) {
        return element.mirrorInfo;
    }
    var div = document.createElement('div');
    var style = div.style;
    var computedStyles = getComputedStyle(element);
    var hidden = 'hidden';
    var focusOut = 'focusout';
    style.whiteSpace = 'pre-wrap';
    if (!isInput)
        style.wordWrap = 'break-word';
    style.position = 'absolute';
    style.visibility = hidden;
    mirrorAttributes.forEach(function (prop) { return style[prop] = computedStyles[prop]; });
    style.overflow = hidden;
    if (isInput) {
        style.whiteSpace = 'nowrap';
    }
    body.appendChild(div);
    element.mirrorInfo = { div: div, span: document.createElement('span'), computedStyles: computedStyles };
    element.addEventListener(focusOut, function cleanup() {
        delete element.mirrorInfo;
        body.removeChild(div);
        element.removeEventListener(focusOut, cleanup);
    });
    return element.mirrorInfo;
}
function caretXY(element, position) {
    if (position === void 0) { position = element.selectionEnd; }
    var isInput = element.nodeName.toLowerCase() === 'input';
    var _a = getMirrorInfo(element, isInput), div = _a.div, span = _a.span, computedStyles = _a.computedStyles;
    var content = element.value.substring(0, position);
    div.textContent = isInput ? content.replace(/\s/g, '\u00a0') : content;
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);
    var rect = element.getBoundingClientRect();
    var top = span.offsetTop + parseInt(computedStyles.borderTopWidth) - element.scrollTop + rect.top;
    var left = span.offsetLeft + parseInt(computedStyles.borderLeftWidth) - element.scrollLeft + rect.left;
    var height = lineHeightInPixels(computedStyles.lineHeight, computedStyles.fontSize);
    return { top: top, left: left, height: height };
}
exports.default = caretXY;
//# sourceMappingURL=caret-xy.js.map