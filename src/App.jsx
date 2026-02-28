import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/login";
// new festival management pages
import FestivalDetails from "./pages/FestivalDetails";
import Collection from "./pages/Collection";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Review from "./pages/Review";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<FestivalDetails />} />
          <Route path="login" element={<LoginPage />} />
          {/* festival management routes */}
          <Route path="festival" element={<FestivalDetails />} />
          <Route path="collection" element={<Collection />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="review" element={<Review />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;