import { Routes, Route } from "react-router-dom";  // remove BrowserRouter here
import { useState, useEffect } from "react";
import ReviewDashboard from "./Dashboard";
import QRCodePage from "./pages/QRCodePage";
import ReviewForm from "./pages/ReviewForm";
import ReviewManagement from "./pages/ReviewManagement";

function App() {
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem("rms_reviews");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("rms_reviews", JSON.stringify(reviews));
  }, [reviews]);

  return (
    // Remove <BrowserRouter> wrapper, keep only <Routes>
    <Routes>
      <Route path="/" element={<ReviewDashboard />} />
      <Route path="/qr" element={<QRCodePage />} />
      <Route
        path="/feedback"
        element={<ReviewForm reviews={reviews} setReviews={setReviews} />}
      />
      <Route
        path="/manage"
        element={<ReviewManagement reviews={reviews} />}
      />
    </Routes>
  );
}

export default App;