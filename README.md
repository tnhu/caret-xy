Viewport-based (fixed) caret position for HTML input and textarea elements.

```
npm i caret-xy
```

or

```
yarn add caret-xy
```

## API

```javascript
caretXY(element, position)
```

- element input or textarea DOM element.
- position is an integer indicating the location of the caret (defaults to element.selectionEnd).

## Sample

```javascript
import caretXY from 'caret-xy'

const input = document.querySelector('input')
caretXY(input)
```

## Known Issue

- Does not work properly for `<input type="email"/>`, `<input type="password"/>` (`element.selectionEnd` always returns `null`).