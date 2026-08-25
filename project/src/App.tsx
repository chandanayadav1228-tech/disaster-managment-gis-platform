import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScenarioProvider } from "@/context/ScenarioContext";
import Layout from "@/components/Layout";
import DashboardPage from "@/pages/DashboardPage";
import GisMapPage from "@/pages/GisMapPage";
import RedZonePage from "@/pages/RedZonePage";
import HabitationPage from "@/pages/HabitationPage";
import DisasterHistoryPage from "@/pages/DisasterHistoryPage";
import RelocationPriorityPage from "@/pages/RelocationPriorityPage";
import SafeSitesPage from "@/pages/SafeSitesPage";
import CarryingCapacityPage from "@/pages/CarryingCapacityPage";
import AiPlannerPage from "@/pages/AiPlannerPage";
import ScenarioPage from "@/pages/ScenarioPage";
import ReportsPage from "@/pages/ReportsPage";

function App() {
  return (
    <ScenarioProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/gis-map" element={<GisMapPage />} />
            <Route path="/red-zone" element={<RedZonePage />} />
            <Route path="/habitations" element={<HabitationPage />} />
            <Route path="/disaster-history" element={<DisasterHistoryPage />} />
            <Route path="/relocation-priority" element={<RelocationPriorityPage />} />
            <Route path="/safe-sites" element={<SafeSitesPage />} />
            <Route path="/carrying-capacity" element={<CarryingCapacityPage />} />
            <Route path="/ai-planner" element={<AiPlannerPage />} />
            <Route path="/scenario" element={<ScenarioPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ScenarioProvider>
  );
}

export default App;
