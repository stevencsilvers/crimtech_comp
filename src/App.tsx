import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReadPage from './pages/ReadPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReadPage />} />
        <Route path="/read" element={<ReadPage />} />
        <Route path="/read/:articleId" element={<ReadPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
