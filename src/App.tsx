import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Projects } from './pages/Projects'
import { Areas } from './pages/Areas'
import { Resources } from './pages/Resources'
import { ArchivePage } from './pages/ArchivePage'
import { Tasks } from './pages/Tasks'
import { Notes } from './pages/Notes'
import { Habits } from './pages/Habits'
import { Goals } from './pages/Goals'
import { InboxPage } from './pages/InboxPage'
import { Reviews } from './pages/Reviews'
import { Media } from './pages/Media'
import { Finance } from './pages/Finance'
import { Tools } from './pages/Tools'
import { Contacts } from './pages/Contacts'
import { Learning } from './pages/Learning'
import { Courses } from './pages/Courses'
import { Papers } from './pages/Papers'
import { Calendar } from './pages/Calendar'
import { Fitness } from './pages/Fitness'
import { Widgets } from './pages/Widgets'
import { WidgetExporter } from './components/WidgetExporter'

export default function App() {
  return (
    <>
      <WidgetExporter />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="widgets" element={<Widgets />} />
          <Route path="projects" element={<Projects />} />
          <Route path="areas" element={<Areas />} />
          <Route path="resources" element={<Resources />} />
          <Route path="archive" element={<ArchivePage />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="notes" element={<Notes />} />
          <Route path="habits" element={<Habits />} />
          <Route path="goals" element={<Goals />} />
          <Route path="fitness" element={<Fitness />} />
          <Route path="media" element={<Media />} />
          <Route path="learning" element={<Learning />} />
          <Route path="courses" element={<Courses />} />
          <Route path="papers" element={<Papers />} />
          <Route path="tools" element={<Tools />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="finance" element={<Finance />} />
        </Route>
      </Routes>
    </>
  )
}
