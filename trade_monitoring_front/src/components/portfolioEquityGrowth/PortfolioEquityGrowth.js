import { useRef, useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Backend from '../../services/Backend';
import ErrorMessage from '../errorMessage/ErrorMessage'
import ErrorBoundary from '../errorBoundary/ErrorBoundary'
import Spinner from '../spinner/Spinner'
import './PortfolioEquityGrowth.scss'


const PortfolioEquityGrowth = () => {
    const plotWrapper = useRef(null)
    const [wrapperSize, setWrapperSize] = useState({})
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [plotData, setPlotData] = useState([])
    const [minMax, setMinMax] = useState([])

    const backend = new Backend()

    const onRequest = () => {
        backend.getEquity()
            .then(res => {
                setError(false)
                setLoading(false)
                fillPlotData(res.rigs)
            })
            .catch((e) => {
                console.log(e)
                setError(true)
                setLoading(true)
            })
    }

    useEffect(() => {
        setWrapperSize({
            width: plotWrapper.current.clientWidth,
            height: plotWrapper.current.clientHeight,
        })

        onRequest()
        const updateTimer = setInterval(onRequest, 5000)
        return (() => {
            clearInterval(updateTimer)
        })
    }, [])

    const fillPlotData = (rigs) => {
        const plot_data = rigs.map(rig => {
            let customdata = []
            for (let i = 0; i < rig.data.date_hover.length; i++) {
                customdata.push([
                    rig.data.date_hover[i],
                    rig.maxdd,
                    rig.teg,
                    rig.averagePNLmonthly,
                    rig.averagePNLannual,
                ])
            }
            return {
                name: rig.name,
                type: 'scatter',
                x: rig.data.date_str,
                y: rig.data.equity,
                // showlegend: true,
                marker: { size: 3 },
                mode: 'lines+markers',
                hovertemplate: '<b>Date</b>: %{customdata[0]}<br>' +
                    '<b>Equity</b>: %{y}<br>' +
                    '<b>MaxRisk</b>: %{customdata[1]}<br>' +
                    '<b>Total Equity Growth</b>: %{customdata[2]}<br>' +
                    '<b>Average P&L monthly</b>: %{customdata[3]}<br>' +
                    '<b>Average P&L annual</b>: %{customdata[3]}<br>',
                customdata: customdata,
            }
        })
        for (let i = 0; i < plot_data.length; i++) {
            const obj = plot_data[i]
            for (let j = 0; j < obj.x.length; j++) {
                obj.x[j] = new Date(obj.x[j])
            }
        }
        const _minMax = [plot_data[0].x[0], plot_data[0].x[plot_data[0].x.length - 1]]
        for (let i = 0; i < plot_data.length; i++) {
            const obj = plot_data[i]
            for (let j = 0; j < obj.x.length; j++) {
                if (obj.x[j] < _minMax[0]) {
                    _minMax[0] = obj.x[j]
                }
                if (obj.x[j] > _minMax[1]) {
                    _minMax[1] = obj.x[j]
                }
            }
        }

        setPlotData(plot_data)
        setMinMax(_minMax)
    }

    return (
        <div className="equity-plot-wrapper" ref={plotWrapper}>
            <ErrorBoundary>
                {error ? <ErrorMessage /> : loading ? <Spinner /> : <Content
                    wrapperSize={wrapperSize}
                    minMax={minMax} plotData={plotData}
                />}
            </ErrorBoundary>
        </div >
    )
}

const Content = (props) => {
    const { wrapperSize, minMax } = props
    const [state, setState] = useState({})
    useEffect(() => {
        setState({
            ...state,
            data: props.plotData
        })
    }, [])

    return (
        <Plot
            data={state.data}
            layout={{
                width: wrapperSize.width,
                height: wrapperSize.height,
                title: 'Portfolio Equity Growth',
                paper_bgcolor: "#282c34",
                plot_bgcolor: "#282c34",
                font: {
                    color: "grey",
                    size: 12,
                },
                uirevision: true,
                xaxis: {
                    title: {
                        text: 'Date',
                    },
                    color: "grey",
                    linecolor: "fff",
                    gridcolor: 'grey',
                    tickformat: "%m.%y",
                    dtick: "M1",
                    tickangle: -90,
                    // range: [minMax[0], minMax[1]]
                },
                yaxis: {
                    title: 'Capital, $',
                    color: "grey",
                    linecolor: "fff",
                    gridcolor: 'grey',
                },
            }}
            frames={state.frames}
            config={state.config}
            onInitialized={(figure) => setState(figure)}
        />
    )
}

export default PortfolioEquityGrowth;