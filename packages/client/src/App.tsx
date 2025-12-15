import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import ChatBot from './components/chat/ChatBot';
import ReviewList from './components/reviews/ReviewList';
import NavBar from './components/navigation/NavBar';

const Layout = () => {
  return (
    <div className="h-screen w-full flex flex-col">
      <NavBar />
      <main className="flex-1 px-4 py-10 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="chatbot" element={<ChatBot />} />
          <Route path="reviews" element={<ReviewList productId={1} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
