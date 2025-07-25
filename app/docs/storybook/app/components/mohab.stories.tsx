```typescript
import { Meta, StoryObj } from '@storybook/react';
import { Mohab } from './Mohab';

const meta: Meta<typeof Mohab> = {
  title: 'Example/Mohab',
  component: Mohab,
  argTypes: {
    name: {
      type: 'string',
      description: 'The name to display.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Mohab>;

const Template: Story = (args) => <Mohab {...args} />;

export const Default: Story = Template.bind({});
Default.args = {
  name: 'Ali',
};

export const Empty: Story = Template.bind({});
Empty.args = {
  name: '',
};

export const WithData: Story = Template.bind({});
WithData.args = {
  name: 'Mohamed',
};

export const WithLongName: Story = Template.bind({});
WithLongName.args = {
  name: 'A Very Long Name Indeed',
};
```
