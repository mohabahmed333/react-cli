# Ahmed Component

A simple React component that displays the name "Ahmed" along with additional names passed as props.

## Installation

```bash
# Assuming you are using npm
npm install <your-package-name> 

# Or if you are using yarn
yarn add <your-package-name>
```

## Import

```javascript
import { Ahmed } from '<your-package-name>';
```

## Props

| Prop Name | Type          | Description                               | Required | Default |
|------------|----------------|-------------------------------------------|----------|---------|
| `name`     | `string`       |  Additional name to display after "Ahmed". | Yes      |         |
| `dd`       | `{ name: string }` | An object containing another name.       | Yes      |         |


## Usage Examples

**Basic Usage:**

```jsx
<Ahmed name="Ali" dd={{ name: "Hasan" }} />
```

This will render:

```
Ahmed Ali Hasan
```

**More complex example:**

```jsx
const myName = "Zayd";
const otherDetails = { name: "Hussein"};

<Ahmed name={myName} dd={otherDetails} />
```

This will render:

```
Ahmed Zayd Hussein
```

## Notes

* Ensure that both `name` and `dd.name` props are provided.  The component will not render correctly if either is missing.


