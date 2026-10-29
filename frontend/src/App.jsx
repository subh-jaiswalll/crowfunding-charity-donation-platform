import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar.jsx";
import Footer from "./Components/Footer.jsx";
import Home from "./pages/Home.jsx";

import Signup from "./pages/USER/Signup.jsx";
import Login from "./pages/USER/Login.jsx";
import Profile from "./pages/USER/Profile.jsx";

import CharityRegister from "./pages/NGO/CharityRegister.jsx";
import CharityProfile from "./pages/NGO/CharityProfile.jsx";
import CharityUpdate from "./pages/NGO/CharityUpdate.jsx";
import CharityDetails from "./pages/NGO/CharityDetails.jsx";
import Charities from "./pages/NGO/Charities.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";

import DonationHistory from "./pages/DONATION/DonationHistory.jsx";
import Donate from "./pages/DONATION/Donate.jsx";

import AdminDashboard from "./pages/ADMIN/AdminDashboard.jsx";

import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import Terms from "./pages/Terms.jsx";

// import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/charity/register" element={<CharityRegister />} />

        <Route path="/charity/profile" element={<CharityProfile />} />

        <Route path="/charity/update" element={<CharityUpdate />} />
        <Route path="/charities" element={<Charities />} />
        <Route path="/charities/:id" element={<CharityDetails />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/donation-history" element={<DonationHistory />} />

        <Route path="/donate" element={<Donate />} />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />

        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;

// Inside your existing Routes:
