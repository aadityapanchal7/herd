
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import EventChat from "./pages/EventChat";
import Chat from "./pages/Chat";
import { AuthProvider } from "./context/AuthContext";
import { StreamChatProvider } from "./context/StreamChatContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <StreamChatProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/event/:eventId/chat" 
                element={
                  <ProtectedRoute requireEmailConfirmation={true}>
                    <EventChat />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat/:eventId" 
                element={
                  <ProtectedRoute requireEmailConfirmation={true}>
                    <Chat />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </StreamChatProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
