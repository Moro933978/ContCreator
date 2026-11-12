import { Routes, Route } from "react-router-dom";

import TechookPremiumWorkspace from "./pages/fristpage";
import AuthPage from "./components/SignUpLogin";
import TechookStudioHero from "./pages/home";
import MainContent from "./pages/Features";
import Feuters from "./pages/FeaturesNext";
import HomeLayout from "./layout/HomeLayout";
import IdeaGenerator from "./components/IdeaGenerator";
import ContentGenerator from "./components/contentgenerator";
import ViralMeterPage from "./components/ViralMeter";
import MiniCalendar from "./components/ContentPlaner"
import PostEditor from "./components/PostEditor";
import Profile from "./pages/profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<TechookPremiumWorkspace />} />

      <Route path="/SignUpLogin" element={<AuthPage />} />

      <Route element={<HomeLayout />}>
        <Route path="/home" element={<TechookStudioHero />} />
        <Route path="/features" element={<MainContent />} />

        {/* No routes matched  Edited*/}
        <Route path="/FeaturesNext" element={<Feuters />} />
        <Route path="/IdeaGenerator" element={<IdeaGenerator />} />
        <Route path="/contentgenerator" element={<ContentGenerator />} />
        <Route path="/ViralMeter" element={<ViralMeterPage />} />
        <Route path="/ContentPlaner" element={<MiniCalendar />} />
        <Route path="/PostEditor" element={<PostEditor />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;