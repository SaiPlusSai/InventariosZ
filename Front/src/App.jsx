import { BrowserRouter } from 'react-router-dom'
import Routes from './routes'
import { NotificationModal } from './components/ui/NotificationModal'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
      <NotificationModal />
    </>
  )
}

export default App
