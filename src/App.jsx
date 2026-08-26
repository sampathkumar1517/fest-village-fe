import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/Register";
// new festival management pages
import FestivalDetails from "./pages/FestivalDetails";
import Collection from "./pages/Collection";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Review from "./pages/Review";
import Users from "./pages/Users";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<FestivalDetails />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          {/* festival management routes */}
          <Route path="festival" element={<FestivalDetails />} />
          <Route path="collection" element={<Collection />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="review" element={<Review />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;