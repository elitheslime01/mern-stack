import { Box } from "@chakra-ui/react";
import { Route, Routes, useLocation } from "react-router-dom";
import GymGoerPage from "./pages/GymGoerPage";
import HomePage from "./pages/HomePage";
import SysAdminPage from "./pages/SysAdminPage";
import Navbar from "./components/Navbar";

function App() {
  const location = useLocation(); // Get the current location

  return (
    <Box minH={"100vh"}>
      {location.pathname !== '/' && <Navbar />} {/* Navbar will not show on HomePage */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gymgoer" element={<GymGoerPage />} />
        <Route path="/sysadmin" element={<SysAdminPage />} />
      </Routes>
    </Box>
  );
}

export default App;