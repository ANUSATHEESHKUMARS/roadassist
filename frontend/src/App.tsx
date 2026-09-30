import { AppRoutes } from "./routes/AppRoutes";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";
function App() {
  return (

    <ToastProvider>
      <AppRoutes />
    </ToastProvider>

  )
}

export default App;

