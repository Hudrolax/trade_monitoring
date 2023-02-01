import { useRef, useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Backend from '../../services/Backend';
import ErrorMessage from '../errorMessage/ErrorMessage'
import Spinner from '../spinner/Spinner'
import ErrorBoundary from '../errorBoundary/ErrorBoundary'
import './PerformanceMonitoring.scss'

const PerformanceMonitoring = (props) => {
    const plotWrapper = useRef(null)
    const [wrapperSize, setWrapperSize] = useState({})
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [optimal, setOptimal] = useState({})
    const [data, setData] = useState({})

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

    const backend = new Backend()

    const onRequest = () => {
        backend.getPerformance()
            .then(res => {
                const { optimalPNL, optimalRisk } = res
                setOptimal({ Risk: [optimalRisk], PNL: [optimalPNL] })
                loadData(res.data)
                setLoading(false)
                setError(false)
            })
            .catch((err) => {
                console.log(err)
                setError(true)
                setLoading(true)
            })
    }

    const loadData = (_data) => {
        setData({
            x: _data.map(item => item.Risk),
            y: _data.map(item => item.PNL),
            customdata: _data.map(item => [
                item.date,
                item.Equity,
                item.Trades,
                item.Note
            ])
        })
    }

    // draw log line
    const log_line_x = []
    const log_line_y = []
    for (let x = -100; x <= 5000; x++) {
        const _x = x / 100
        log_line_x.push(_x + 0.7)
        log_line_y.push(4.5 * Math.log10(_x) + 2.8)
    }

    return (
        <div className='plot-wrapper' ref={plotWrapper}>
            <ErrorBoundary>
                {error ? <ErrorMessage /> : loading ? <Spinner /> : <Content
                log_line_x = {log_line_x}
                log_line_y = {log_line_y}
                optimal = {optimal}
                data = {data}
                wrapperSize = {wrapperSize}
                />}
            </ErrorBoundary>
        </div>
    )
}

const Content = (props) => {
    const {log_line_x, log_line_y, optimal, data, wrapperSize} = props
    return (
        <Plot
            data={[
                {
                    name: 'Risk/Reward Frontier',
                    type: 'line',
                    x: log_line_x,
                    y: log_line_y,
                    showlegend: false,
                },
                {
                    name: 'optimal',
                    x: optimal.Risk,
                    y: optimal.PNL,
                    type: 'scatter',
                    mode: 'markers',
                    marker: { color: 'f00', size: 15 },
                    showlegend: false,
                },
                {
                    name: 'data',
                    showlegend: false,
                    type: 'scatter',
                    mode: 'markers',
                    marker: { color: '#5476ff', size: 15 },
                    hovertemplate: 'Date: %{customdata[0]}<br>' +
                        '<b>P&L</b>: %{y:.1f}<br>' +
                        '<b>Risk</b>: %{x}<br>' +
                        'Equity: %{customdata[1]}<br>' +
                        'Trades: %{customdata[2]}<br>' +
                        'Note: %{customdata[3]}',
                    ...data
                }
            ]}
            layout={{
                width: wrapperSize.width,
                height: wrapperSize.height,
                title: 'Risk/Reward Frontier',
                paper_bgcolor: "#282c34",
                plot_bgcolor: "#282c34",
                font: {
                    color: "grey",
                    size: 16,
                },
                uirevision: true,
                xaxis: {
                    title: {
                        text: 'Risk',
                    },
                    color: "grey",
                    linecolor: "fff",
                    gridcolor: 'grey',
                    // type: 'log',
                    // dtick: "L15",
                    dtick: 1,
                    // tickvals: [0, 0.5, 1, 5, 10, 20, 50, 100],
                    // range: [-1, 2],
                    tickangle: -90,
                    range: [0, Math.max(10, Math.max(...data.x) + 2)],
                },
                yaxis: {
                    title: 'Reward Frontier',
                    color: "grey",
                    linecolor: "fff",
                    gridcolor: 'grey',
                    dtick: 1,
                    range: [Math.min(-2, Math.min(...data.y) - 2), Math.max(8, Math.max(...data.y) + 2)]
                },
            }}
        />
    )
}

export default PerformanceMonitoring;