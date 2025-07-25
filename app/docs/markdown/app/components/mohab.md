# Mohab Component

A simple React component that displays the name "Mohab" followed by a given name.

## Installation

```bash
# Assuming you are using npm
npm install your-package-name  //Replace your-package-name with the actual package name.
```

or

```bash
# Assuming you are using yarn
yarn add your-package-name //Replace your-package-name with the actual package name.
```

## Import

```javascript
import { Mohab } from 'your-package-name'; //Replace your-package-name with the actual package name.
```

## Props

| Prop    | Type     | Description                               |
|---------|----------|-------------------------------------------|
| `name`  | `string` | The name to be displayed after "Mohab". |


## Usage Examples

**Basic Usage:**

```javascript
<Mohab name="Ali" />
```

This will render:

```
Mohab Ali
```

**Another Example:**

```javascript
<Mohab name="Ahmed" />
```

This will render:

```
Mohab Ahmed
```

## Notes

- The component expects a `name` prop of type string.  Failure to provide this prop or providing a prop of an incorrect type will likely result in an error or unexpected behavior.

