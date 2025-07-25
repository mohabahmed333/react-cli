import mohab from '../../../../components/mohab';

export default {
  title: 'Components/mohab',
  component: mohab,
};

const Template = (args) => <mohab {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: 'Example',
};

export const Empty = Template.bind({});
Empty.args = {};
