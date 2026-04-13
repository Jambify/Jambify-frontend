import { Routes, Route } from 'react-router-dom';
import Dashboard from "./Pages/Dashboard";
import Quiz from "./Pages/Quiz"; 

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/quiz" element={<Quiz />} />
    </Routes>
  );
};

export default App;