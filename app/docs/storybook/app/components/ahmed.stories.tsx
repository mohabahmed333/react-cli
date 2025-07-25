import ahmed from '../../../../components/ahmed';

export default {
  title: 'Components/ahmed',
  component: ahmed,
};

const Template = (args) => <ahmed {...args} />;

export const Default = Template.bind({});
Default.args = {
};

export const Empty = Template.bind({});
Empty.args = {};
