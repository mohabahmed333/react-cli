import React from 'react';
import styles from './Test.module.css';

interface TestProps {
  // define props here
}

const Test: React.FC<TestProps> = (props) => {
  return (
    <div className={styles.container}>
      {/* Test component */}
    </div>
  );
};

export default Test;
