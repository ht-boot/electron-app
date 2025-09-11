import { Route, Routes } from 'react-router-dom'
import AppLayout from './pages/layout/index'
import Home from './pages/lyrics/index'
import AppBar from './components/appBar'
import Loading from './pages/loading'

function App(): React.JSX.Element {
  return (
    <>
      <div className="App">
        <AppBar />
        <Routes>
          <Route path="/" element={<Loading />} />
          <Route path="/home" element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
          </Route>
        </Routes>
      </div>
    </>
  )
}

export default App
