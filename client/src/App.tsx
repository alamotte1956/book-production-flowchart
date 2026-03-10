import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const Home = lazy(() => import("./pages/Home"));
const ProjectTracker = lazy(() => import("./pages/ProjectTracker"));
const Resources = lazy(() => import("./pages/Resources"));
const Timeline = lazy(() => import("./pages/Timeline"));
const AutoProduce = lazy(() => import("./pages/AutoProduce"));
const BibleStudio = lazy(() => import("./pages/BibleStudio"));
const SpineCalculator = lazy(() => import("./pages/SpineCalculator"));
const CoverDesigner = lazy(() => import("./pages/CoverDesigner"));
const IsbnManager = lazy(() => import("./pages/IsbnManager"));
const UserGuide = lazy(() => import("./pages/UserGuide"));
const Templates = lazy(() => import("./pages/Templates"));
const ISBNLookup = lazy(() => import("./pages/ISBNLookup"));
const GuidedJourney = lazy(() => import("./pages/GuidedJourney"));
const PrintSpecs = lazy(() => import("./pages/PrintSpecs"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PrivacyTerms = lazy(() => import("./pages/PrivacyTerms"));
const ConfirmEmail = lazy(() => import("./pages/ConfirmEmail"));
const AffiliateProgram = lazy(() => import("./pages/AffiliateProgram"));
const AffiliateDashboard = lazy(() => import("./pages/AffiliateDashboard"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminPayouts = lazy(() => import("./pages/AdminPayouts"));
const Glossary = lazy(() => import("./pages/Glossary"));
const DistributionGuide = lazy(() => import("./pages/DistributionGuide"));
const RoyaltyCalculator = lazy(() => import("./pages/RoyaltyCalculator"));
const MarketingToolkit = lazy(() => import("./pages/MarketingToolkit"));
const PreLaunchPage = lazy(() => import("./pages/PreLaunchPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      color: "#c9a96e",
      fontFamily: "Lora, serif",
      fontSize: "1.125rem",
    }}>
      Loading…
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={LandingPage} />
        <Route path={"/dashboard"} component={Home} />
        <Route path={"/pricing"} component={Pricing} />
        <Route path={"/privacy-terms"} component={PrivacyTerms} />
        <Route path={"/login"} component={Login} />
        <Route path={"/reset-password"} component={ResetPassword} />
        <Route path={"/admin/payouts"} component={AdminPayouts} />
        <Route path={"/confirm-email"} component={ConfirmEmail} />
        <Route path={"/affiliates"} component={AffiliateProgram} />
        <Route path={"/affiliate-dashboard"} component={AffiliateDashboard} />
        <Route path={"/project/:id"} component={ProjectTracker} />
        <Route path={"/resources"} component={Resources} />
        <Route path={"/timeline/:id"} component={Timeline} />
        <Route path={"/timeline"}><Redirect to="/timeline/0" /></Route>
        <Route path={"/auto-produce/:id"} component={AutoProduce} />
        <Route path={"/auto-produce"}><Redirect to="/auto-produce/0" /></Route>
        <Route path={"/bible-studio"} component={BibleStudio} />
        <Route path={"/spine-calculator"} component={SpineCalculator} />
        <Route path={"/cover-designer"} component={CoverDesigner} />
        <Route path={"/isbn-manager"} component={IsbnManager} />
        <Route path={"/guide"} component={UserGuide} />
        <Route path={"/templates"} component={Templates} />
        <Route path={"/ebp-templates"} component={Templates} />
        <Route path={"/isbn-lookup"} component={ISBNLookup} />
        <Route path={"/guided-journey"} component={GuidedJourney} />
        <Route path={"/print-specs"} component={PrintSpecs} />
        <Route path={"/glossary"} component={Glossary} />
        <Route path={"/distribution-guide"} component={DistributionGuide} />
        <Route path={"/royalty-calculator"} component={RoyaltyCalculator} />
        <Route path={"/marketing-toolkit"} component={MarketingToolkit} />
        <Route path={"/book/:id/preview"} component={PreLaunchPage} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
