import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TenantProvider } from "@/contexts/TenantContext";
import { RBACProvider } from "@/contexts/RBACContext";
import { useAuth } from "@/hooks/useAuth";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import AgencyIndex from "./pages/AgencyIndex";
import NotFound from "./pages/NotFound";
import Planning from "./pages/Planning";
import Taxonomy from "./pages/Taxonomy";
import Efficiency from "./pages/Efficiency";
import URLs from "./pages/URLs";
import Checklists from "./pages/Checklists";
import Creatives from "./pages/Creatives";
// Integrations page removed — consolidated into DataIntegrations
import Audit from "./pages/Audit";
import InsertionOrders from "./pages/InsertionOrders";
import Clients from "./pages/Clients";
import Suppliers from "./pages/Suppliers";
import Profitability from "./pages/Profitability";
import Proposals from "./pages/Proposals";
import SLA from "./pages/SLA";
import Sales from "./pages/Sales";
import Governance from "./pages/Governance";
import Incentives from "./pages/Incentives";
import Narrative from "./pages/Narrative";
import CreativeIntelligence from "./pages/CreativeIntelligence";
import Knowledge from "./pages/Knowledge";
import Simulation from "./pages/Simulation";
import Maturity from "./pages/Maturity";
import Settings from "./pages/Settings";
import ClientDetail from "./pages/ClientDetail";
import AlertsCenter from "./pages/AlertsCenter";
import FinancialOverview from "./pages/FinancialOverview";
import Benchmark from "./pages/Benchmark";
import OptimizationCenter from "./pages/OptimizationCenter";
import SubscriptionUsage from "./pages/SubscriptionUsage";
import TenantSettings from "./pages/TenantSettings";
// IntegrationCenter removed — consolidated into DataIntegrations
import DailyBrief from "./pages/DailyBrief";
import WeeklyReview from "./pages/WeeklyReview";
import MonthlyExecutiveSummary from "./pages/MonthlyExecutiveSummary";
import ImpactTracking from "./pages/ImpactTracking";
import AIInsightsCenter from "./pages/AIInsightsCenter";
import StatisticalIntelligence from "./pages/StatisticalIntelligence";
import PlatformConsole from "./pages/PlatformConsole";
import PatternIntelligence from "./pages/PatternIntelligence";
import DataIntegrations from "./pages/DataIntegrations";
import ArchitectureViewer from "./pages/ArchitectureViewer";
import IntelligenceOverview from "./pages/IntelligenceOverview";
import ChannelsFormats from "./pages/ChannelsFormats";
import LeadGen from "./pages/LeadGen";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TenantProvider>
        <RBACProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<AuthGuard><Outlet /></AuthGuard>}>
                  {/* OPERAÇÃO */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/planning" element={<Planning />} />
                  <Route path="/taxonomy" element={<Taxonomy />} />
                  <Route path="/urls" element={<URLs />} />
                  <Route path="/checklists" element={<Checklists />} />
                  <Route path="/creatives" element={<Creatives />} />
                  <Route path="/channels-formats" element={<ChannelsFormats />} />
                  <Route path="/lead-gen" element={<LeadGen />} />

                  {/* INTELIGÊNCIA */}
                  <Route path="/intelligence" element={<IntelligenceOverview />} />
                  <Route path="/efficiency" element={<Efficiency />} />
                  <Route path="/audit" element={<Audit />} />
                  <Route path="/creative-intelligence" element={<CreativeIntelligence />} />
                  <Route path="/knowledge" element={<Knowledge />} />
                  <Route path="/simulation" element={<Simulation />} />
                  <Route path="/maturity" element={<Maturity />} />
                  <Route path="/alerts" element={<AlertsCenter />} />
                  <Route path="/benchmark" element={<Benchmark />} />
                  <Route path="/optimization-center" element={<OptimizationCenter />} />
                  <Route path="/daily-brief" element={<DailyBrief />} />
                  <Route path="/weekly-review" element={<WeeklyReview />} />
                  <Route path="/impact" element={<ImpactTracking />} />
                  <Route path="/ai-insights" element={<AIInsightsCenter />} />
                  <Route path="/statistical-intelligence" element={<StatisticalIntelligence />} />
                  <Route path="/pattern-intelligence" element={<PatternIntelligence />} />

                  {/* FINANCEIRO */}
                  <Route path="/insertion-orders" element={<InsertionOrders />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/clients/:clientId" element={<ClientDetail />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/profitability" element={<Profitability />} />
                  <Route path="/financial-overview" element={<FinancialOverview />} />

                  {/* ESTRATÉGIA */}
                  <Route path="/executive-dashboard" element={<ExecutiveDashboard />} />
                  <Route path="/agency-index" element={<AgencyIndex />} />
                  <Route path="/narrative" element={<Narrative />} />
                  <Route path="/monthly-executive" element={<MonthlyExecutiveSummary />} />

                  {/* GESTÃO */}
                  <Route path="/proposals" element={<Proposals />} />
                  <Route path="/sla" element={<SLA />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/governance" element={<Governance />} />
                  <Route path="/incentives" element={<Incentives />} />

                  {/* ADMIN */}
                  <Route path="/data-integrations" element={<DataIntegrations />} />
                  <Route path="/subscription" element={<SubscriptionUsage />} />
                  <Route path="/agency-settings" element={<TenantSettings />} />

                  {/* CONFIGURAÇÕES */}
                  <Route path="/settings" element={<Settings />} />

                  {/* PLATFORM */}
                  <Route path="/platform-console" element={<PlatformConsole />} />
                  <Route path="/architecture" element={<ArchitectureViewer />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </RBACProvider>
      </TenantProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

