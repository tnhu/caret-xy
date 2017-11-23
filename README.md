Viewport-based (fixed) caret position for HTML input and textarea elements.

```
npm i caret-xy
```

or

```
yarn add caret-xy
```

## Usage

```javascript
import caretXY from 'caret-xy'

caretXY(document.querySelector('input'))
```

## Known Issues

- Does not work properly for `<input type="email"/>`, `<input type="password"/>` (`element.selectionEnd` is always `null`).