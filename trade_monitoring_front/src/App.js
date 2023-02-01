import { useState } from 'react'
import PortfolioMonitoring from './components/portfolioMonitoring/PortfolioMonitoring';
import PerformanceMonitoring from './components/performanceMonitoring/PerformanceMonitoring';
import PortfolioEquityGrowth from './components/portfolioEquityGrowth/PortfolioEquityGrowth';
import './App.scss';

function App() {
  const [content, setContent] = useState([<PortfolioMonitoring key={0}/>])
  const [active, setActive] = useState(0)

  const onClickTab = (tab) => {
    if (tab === 'monitoring') {
      setContent([<PortfolioMonitoring key={0} />])
      setActive(0)
    } else if (tab === 'portfolio') {
      setContent([<PerformanceMonitoring key={1} />])
      setActive(1)
    } else if (tab === 'equity') {
      setContent([<PortfolioEquityGrowth key={2}/>])
      setActive(2)
    } else {
      const err = `Wrong tab ${tab}`
      console.log(err)
      throw new Error(err)
    }
  }

  return (
    <div className="wrapper">
      <div className="app">
        <div className="app-header">
          <div className="tabs">
            <div className={`tabs_item ${active === 0 ? 'active' : ''}`}
              onClick={() => { onClickTab('monitoring') }}>Monitoring</div>
            <div className={`tabs_item ${active === 1 ? 'active' : ''}`}
              onClick={() => { onClickTab('portfolio') }}>Portfolio</div>
            <div className={`tabs_item ${active === 2 ? 'active' : ''}`}
              onClick={() => { onClickTab('equity') }}>Portfolio Equity Growth</div>
          </div>
        </div>

        <div className="body">
          {content}
        </div>
      </div>
    </div>
  );
}

export default App;
