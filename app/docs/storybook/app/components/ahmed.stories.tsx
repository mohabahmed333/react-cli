```jsx
import { Ahmed } from './Ahmed';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Ahmed> = {
  title: 'Example/Ahmed',
  component: Ahmed,
  argTypes: {
    name: {
      description: 'The name prop',
      type: { name: 'string', required: true },
    },
    dd: {
      description: 'The dd prop',
      type: { name: 'object', required: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Ahmed>;

const Template: React.FC<{ args: typeof meta.argTypes }> = ({ args }) => (
  <Ahmed {...args} />
);

export const Default: Story = {
  args: {
    name: 'Default Name',
    dd: { name: 'Default DD Name' },
  },
};

export const Empty: Story = {
  args: {
    name: '',
    dd: { name: '' },
  },
};

export const WithData: Story = {
  args: {
    name: 'John Doe',
    dd: { name: 'Extra Data' },
  },
};

export const LongName: Story = {
  args: {
    name: 'This is a very long name to test the component',
    dd: { name: 'Long DD Name' },
  },
};
```
