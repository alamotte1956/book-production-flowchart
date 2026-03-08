import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
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
import Templates from "./pages/Templates";
import ISBNLookup from "./pages/ISBNLookup";
import GuidedJourney from "./pages/GuidedJourney";
import PrintSpecs from "./pages/PrintSpecs";
import Pricing from "./pages/Pricing";
import PrivacyTerms from "./pages/PrivacyTerms";
import ConfirmEmail from "./pages/ConfirmEmail";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/privacy-terms"} component={PrivacyTerms} />
      <Route path={"/confirm-email"} component={ConfirmEmail} />
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
      <Route path={"/kpa-templates"} component={Templates} />
      <Route path={"/isbn-lookup"} component={ISBNLookup} />
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
