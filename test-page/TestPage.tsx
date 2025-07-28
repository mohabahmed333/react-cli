import React from 'react';

interface TestPageProps {}

const TestPage: React.FC<TestPageProps> = () => {
  return (
    <div>
      <h1>TestPage Page</h1>
      <p>This is a test page for performance auditing</p>
      <div>
        <button>Click me</button>
        <input type="text" placeholder="Type something..." />
      </div>
    </div>
  );
};

export default TestPage;
