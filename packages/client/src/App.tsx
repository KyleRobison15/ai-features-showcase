import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import ChatBot from './components/chat/ChatBot';
import ReviewList from './components/reviews/ReviewList';
import NavBar from './components/navigation/NavBar';
import { ThemeProvider } from './contexts/ThemeContext';

const Layout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="chatbot" element={<ChatBot />} />
            <Route path="reviews" element={<ReviewList productId={1} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
