import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Home from './routes/Home.tsx'
import SignIn from './routes/SignIn.tsx'
import SignUp from './routes/SignUp.tsx'
import Dashboard from './routes/Dashboard.tsx'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/signin', element: <SignIn /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/dashboard', element: <Dashboard /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
