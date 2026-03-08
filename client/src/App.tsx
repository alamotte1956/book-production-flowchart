import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProjectTracker from "./pages/ProjectTracker";
import Resources from "./pages/Resources";
import Timeline from "./pages/Timeline";
import AutoProduce from "./pages/AutoProduce";
import BibleStudio from "./pages/BibleStudio";
import SpineCalculator from "./pages/SpineCalculator";
import CoverDesigner from "./pages/CoverDesigner";
import IsbnManager from "./pages/IsbnManager";
import UserGuide from "./pages/UserGuide";
import CDPTemplates from "./pages/CDPTemplates";
import ISBNLookup from "./pages/ISBNLookup";
import KPATemplates from "./pages/KPATemplates";
import GuidedJourney from "./pages/GuidedJourney";
import PrintSpecs from "./pages/PrintSpecs";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/project/:id"} component={ProjectTracker} />
      <Route path={"/resources"} component={Resources} />
      <Route path={"/timeline/:id"} component={Timeline} />
      <Route path={"/auto-produce/:id"} component={AutoProduce} />
      <Route path={"/bible-studio"} component={BibleStudio} />
      <Route path={"/spine-calculator"} component={SpineCalculator} />
      <Route path={"/cover-designer"} component={CoverDesigner} />
      <Route path={"/isbn-manager"} component={IsbnManager} />
      <Route path={"/guide"} component={UserGuide} />
      <Route path={"/cdp-templates"} component={CDPTemplates} />
      <Route path={"/isbn-lookup"} component={ISBNLookup} />
      <Route path={"/kpa-templates"} component={KPATemplates} />
      <Route path={"/guided-journey"} component={GuidedJourney} />
      <Route path={"/print-specs"} component={PrintSpecs} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
