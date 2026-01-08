import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Component/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Blog from './pages/Blog';
import Training from './pages/Training';
import Products from './pages/Products';
import Booking from './pages/Booking';
import Admin from './pages/Admin';
import Login from './pages/Login';
import ProtectedRoute from './Component/ProtectedRoute';
import WhatsAppButton from './Component/WhatsAppButton';

function App() {
  return (
    <Router>
      {/* Navbar inga thaan varum */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/training" element={<Training />} />
        <Route path="/products" element={<Products />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
      <WhatsAppButton />
    </Router>
  );
}
export default App;