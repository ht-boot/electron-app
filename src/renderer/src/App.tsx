import { Route, Routes } from 'react-router-dom'
import AppLayout from './pages/layout/index'
import About from './pages/about/index'
import Home from './pages/home/index'

function App(): React.JSX.Element {
  return (
    <>
      <div className="App">
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
