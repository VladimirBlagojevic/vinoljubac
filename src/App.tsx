import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ListPage } from "@/pages/ListPage";
import { WinePage } from "@/pages/WinePage";
import { TastingProvider } from "@/tasting-context";

export default function App() {
  return (
    <BrowserRouter>
      <TastingProvider>
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/vino/:id" element={<WinePage />} />
        </Routes>
      </TastingProvider>
    </BrowserRouter>
  );
}
