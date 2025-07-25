import { useState } from 'react';

export const useSaeed = (): [boolean, () => void] => {
  const [state, setState] = useState(false);
  const toggle = () => setState(!state);
  return [state, toggle];
};
