import { useState } from 'react';

export const useSalah = (): [boolean, () => void] => {
  const [state, setState] = useState(false);
  const toggle = () => setState(!state);
  return [state, toggle];
};
