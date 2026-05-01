import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-14">
        <HomePage />
      </main>
      <Footer />
    </div>
  );
}
