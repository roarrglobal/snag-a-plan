import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import MarketingHome from "./pages/MarketingHome";
import NerveHome from "./pages/NerveHome";
import ProductPage from "./pages/ProductPage";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import CareersPage from "./pages/CareersPage";
import HelpIndexPage from "./pages/HelpIndexPage";
import HelpSectionPage from "./pages/HelpSectionPage";
import HelpArticlePage from "./pages/HelpArticlePage";
import SolutionsPage from "./pages/SolutionsPage";
import SolutionPersonalPage from "./pages/SolutionPersonalPage";
import SolutionSalesPage from "./pages/SolutionSalesPage";
import SolutionFinancePage from "./pages/SolutionFinancePage";
import SolutionProductPage from "./pages/SolutionProductPage";
import SolutionHRPage from "./pages/SolutionHRPage";
import SolutionMarketingPage from "./pages/SolutionMarketingPage";
import SolutionOperationsPage from "./pages/SolutionOperationsPage";
import Analyze from "./pages/Analyze";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AnalysisDetail from "./pages/AnalysisDetail";
import GateRegistry from "./pages/GateRegistry";
import AnalysisHistoryPage from "./pages/AnalysisHistoryPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationSettingsPage from "./pages/NotificationSettingsPage";
import UnsubscribePage from "./pages/UnsubscribePage";
import ProfileSettings from "./pages/ProfileSettings";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Disclaimer from "./pages/Disclaimer";
import RefundPage from "./pages/RefundPage";
import GDPRPage from "./pages/GDPRPage";
import SecurityPage from "./pages/SecurityPage";
import NotFound from "./pages/NotFound";
import JournalPage from "./pages/JournalPage";
import JournalNewPage from "./pages/JournalNewPage";
import DecisionsPage from "./pages/DecisionsPage";
import DecisionNewPage from "./pages/DecisionNewPage";
import DecisionDetailPage from "./pages/DecisionDetailPage";
import PostMortemPage from "./pages/PostMortemPage";
import PostMortemNewPage from "./pages/PostMortemNewPage";
import PostMortemDetailPage from "./pages/PostMortemDetailPage";
import QuickRetroPage from "./pages/QuickRetroPage";
import HabitsPage from "./pages/HabitsPage";
import FrameworksPage from "./pages/FrameworksPage";
import SwotAnalysisPage from "./pages/SwotAnalysisPage";
import PorterAnalysisPage from "./pages/PorterAnalysisPage";
import PremortemAnalysisPage from "./pages/PremortemAnalysisPage";
import JournalDetailPage from "./pages/JournalDetailPage";
import ReportsPage from "./pages/ReportsPage";
import DecisionOutcomePage from "./pages/DecisionOutcomePage";
import ReadingPage from "./pages/ReadingPage";
import TeamNewPage from "./pages/TeamNewPage";
import TeamDashboardPage from "./pages/TeamDashboardPage";
import TeamMembersPage from "./pages/TeamMembersPage";
import TeamSettingsPage from "./pages/TeamSettingsPage";
import TeamDecisionsPage from "./pages/TeamDecisionsPage";
import TeamDecisionDetailPage from "./pages/TeamDecisionDetailPage";
import TeamDecisionNewPage from "./pages/TeamDecisionNewPage";
import TeamAnalyticsPage from "./pages/TeamAnalyticsPage";
import TeamOutcomePage from "./pages/TeamOutcomePage";
import TeamTemplatesPage from "./pages/TeamTemplatesPage";
import TeamTemplateDetailPage from "./pages/TeamTemplateDetailPage";
import TeamTemplateNewPage from "./pages/TeamTemplateNewPage";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import TeamAdminPage from "./pages/TeamAdminPage";
import TeamAuditLogPage from "./pages/TeamAuditLogPage";
import { TeamLayout } from "@/components/team/TeamLayout";
import SharedSnagPage from "./pages/SharedSnagPage";
import ScanDashboard from "./pages/scan/ScanDashboard";
import ScanNew from "./pages/scan/ScanNew";
import ScanReports from "./pages/scan/ScanReports";
import Zero from "./pages/Zero";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<NerveHome />} />
              <Route path="/snagme" element={<MarketingHome />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/solutions" element={<SolutionsPage />} />
              <Route path="/solutions/personal" element={<SolutionPersonalPage />} />
              <Route path="/solutions/sales" element={<SolutionSalesPage />} />
              <Route path="/solutions/finance" element={<SolutionFinancePage />} />
              <Route path="/solutions/product" element={<SolutionProductPage />} />
              <Route path="/solutions/hr" element={<SolutionHRPage />} />
              <Route path="/solutions/marketing" element={<SolutionMarketingPage />} />
              <Route path="/solutions/operations" element={<SolutionOperationsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/help" element={<HelpIndexPage />} />
              <Route path="/help/:sectionId" element={<HelpSectionPage />} />
              <Route path="/help/:sectionId/:articleId" element={<HelpArticlePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/refund" element={<RefundPage />} />
              <Route path="/gdpr" element={<GDPRPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/invite/:token" element={<AcceptInvitePage />} />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
              <Route path="/s/:code" element={<SharedSnagPage />} />

              {/* Nerve Scan module */}
              <Route path="/scan" element={<ScanDashboard />} />
              <Route path="/scan/new" element={<ScanNew />} />
              <Route path="/scan/reports" element={<ScanReports />} />

              {/* ZERO belief examination module */}
              <Route path="/zero" element={<Zero />} />
              
              {/* App routes with layout */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analyze" element={<Analyze />} />
                <Route path="/analyze/gates" element={<GateRegistry />} />
                <Route path="/analyses" element={<AnalysisHistoryPage />} />
                <Route path="/analysis/:id" element={<AnalysisDetail />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/journal/new" element={<JournalNewPage />} />
                <Route path="/journal/:id" element={<JournalDetailPage />} />
                <Route path="/decisions" element={<DecisionsPage />} />
                <Route path="/decisions/new" element={<DecisionNewPage />} />
                <Route path="/decisions/:id" element={<DecisionDetailPage />} />
                <Route path="/decisions/:id/outcome" element={<DecisionOutcomePage />} />
                <Route path="/post-mortem" element={<PostMortemPage />} />
                <Route path="/post-mortem/new" element={<PostMortemNewPage />} />
                <Route path="/post-mortem/:id" element={<PostMortemDetailPage />} />
                <Route path="/quick-retro" element={<QuickRetroPage />} />
                <Route path="/habits" element={<HabitsPage />} />
                <Route path="/frameworks" element={<FrameworksPage />} />
                <Route path="/frameworks/swot/:id" element={<SwotAnalysisPage />} />
                <Route path="/frameworks/porter/:id" element={<PorterAnalysisPage />} />
                <Route path="/frameworks/premortem/:id" element={<PremortemAnalysisPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/reading/:id" element={<ReadingPage />} />
              </Route>
              
              {/* Team routes */}
              <Route path="/team/new" element={<TeamNewPage />} />
              <Route path="/team/:slug" element={<TeamLayout />}>
                <Route path="dashboard" element={<TeamDashboardPage />} />
                <Route path="members" element={<TeamMembersPage />} />
                <Route path="settings" element={<TeamSettingsPage />} />
                <Route path="decisions" element={<TeamDecisionsPage />} />
                <Route path="decisions/new" element={<TeamDecisionNewPage />} />
                <Route path="decisions/:decisionId" element={<TeamDecisionDetailPage />} />
                <Route path="decisions/:decisionId/outcome" element={<TeamOutcomePage />} />
                <Route path="templates" element={<TeamTemplatesPage />} />
                <Route path="templates/new" element={<TeamTemplateNewPage />} />
                <Route path="templates/:templateId" element={<TeamTemplateDetailPage />} />
                <Route path="analytics" element={<TeamAnalyticsPage />} />
                <Route path="admin" element={<TeamAdminPage />} />
                <Route path="audit-log" element={<TeamAuditLogPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
