import { useState } from 'react';

export const useMohab = (): [boolean, () => void] => {
  const [state, setState] = useState(false);
  const toggle = () => setState(!state);
  return [state, toggle];
};
