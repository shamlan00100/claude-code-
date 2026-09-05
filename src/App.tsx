import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ClientShell } from '@/components/layout/ClientShell'
import { TrainerShell } from '@/components/layout/TrainerShell'
import { Home } from '@/routes/Home'
import { Today } from '@/screens/client/Today'
import { SetLogger } from '@/screens/client/SetLogger'
import { SnapMeal } from '@/screens/client/SnapMeal'
import { Progress } from '@/screens/client/Progress'
import { ReviewQueue } from '@/screens/trainer/ReviewQueue'
import { ClientRoster } from '@/screens/trainer/ClientRoster'
import { ProgramBuilder } from '@/screens/trainer/ProgramBuilder'
import { ComponentLibrary } from '@/routes/ComponentLibrary'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/components" element={<ComponentLibrary />} />

        <Route path="/app" element={<ClientShell />}>
          <Route index element={<Navigate to="today" replace />} />
          <Route path="today" element={<Today />} />
          <Route path="log" element={<SetLogger />} />
          <Route path="meals" element={<SnapMeal />} />
          <Route path="progress" element={<Progress />} />
        </Route>

        <Route path="/coach" element={<TrainerShell />}>
          <Route index element={<Navigate to="queue" replace />} />
          <Route path="queue" element={<ReviewQueue />} />
          <Route path="roster" element={<ClientRoster />} />
          <Route path="programs" element={<ProgramBuilder />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
