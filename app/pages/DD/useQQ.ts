import { useState, useEffect } from 'react';

/**
 * A custom hook to manage a QQ number.
 * @param initialQQ - The initial QQ number.  Defaults to null if not provided.
 * @returns An object containing the current QQ number and functions to update it.  Returns null if invalid QQ is provided.
 */
const useQQ = (initialQQ: string | number | null = null): { qq: string | null; setQQ: (qq: string | number | null) => void; isValid: boolean } | null => {
  const [qq, setQQInternal] = useState<string | null>(initialQQ ? String(initialQQ) : null);
  const [isValid, setIsValid] = useState<boolean>(isValidQQ(qq));

  const setQQ = (newQQ: string | number | null) => {
    const qqString = newQQ ? String(newQQ) : null;
    setQQInternal(qqString);
    setIsValid(isValidQQ(qqString));
  };


  useEffect(() => {
    setIsValid(isValidQQ(qq));
  }, [qq]);

  return qq === null || !isValid ? null : { qq, setQQ, isValid };
};


const isValidQQ = (qq: string | null): boolean => {
  if (qq === null) return false;
  return /^[1-9][0-9]{4,11}$/.test(qq);
};

export default useQQ;
