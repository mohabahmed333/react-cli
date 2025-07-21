import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        {/* Add your routes here */}
      </Routes>
    </BrowserRouter>
  );
}
