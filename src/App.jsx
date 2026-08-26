import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/Register";
import OrganizerLogin from "./pages/OrganizerLogin";
import OrganizerRegister from "./pages/OrganizerRegister";
import FestivalDetails from "./pages/FestivalDetails";
import Collection from "./pages/Collection";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Review from "./pages/Review";
import Users from "./pages/Users";

function OrganizerRoute({ children }) {
  const { isOrganizer } = useAuth();
  if (!isOrganizer) {
    return <Navigate to="/organizer/login" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<FestivalDetails />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="organizer/login" element={<OrganizerLogin />} />
            <Route path="organizer/register" element={<OrganizerRegister />} />
            <Route path="festival" element={<FestivalDetails />} />
            <Route path="collection" element={<Collection />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="review" element={<Review />} />
            <Route
              path="users"
              element={
                <OrganizerRoute>
                  <Users />
                </OrganizerRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
