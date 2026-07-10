import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Routes from './routes'
import { NotificationModal } from './components/ui/NotificationModal'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
      <NotificationModal />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </>
  )
}

export default App
