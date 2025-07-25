import React from 'react';

export const Ahmed = ({ name, dd }: { name: string, dd: { name: string  } }) => {
  return <div>Ahmed {name} {dd.name}</div>;
};
