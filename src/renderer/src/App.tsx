import { Route, Routes } from 'react-router-dom'
import AppLayout from './pages/layout/index'
import About from './pages/about/index'
import Home from './pages/home/index'
import TitleBar from './components/electronBar/electronBar'

function App(): React.JSX.Element {
  return (
    <>
      <div className="App">
        <TitleBar />
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Route>
        </Routes>
      </div>
    </>
  )
}

export default App
