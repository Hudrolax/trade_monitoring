import { useState, useEffect } from 'react'
import ErrorMessage from '../errorMessage/ErrorMessage'
import Spinner from '../spinner/Spinner'
import View from './View';
import Tsunami from './Tsunami';
import OnOff from './OnOff';
import DateTime from './DateTime';
import Backend from '../../services/Backend';
import './PortfolioMonitoring.scss'


// function getRandomInt(min, max) {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
// }

// const db_rigs = [
//     { id: 1, name: 'EURUSD M5', load: 4, tsunami: 0, on: 0 },
//     { id: 2, name: 'EURUSD M5', load: 15, tsunami: 0, on: 0 },
//     { id: 3, name: 'EURUSD M5', load: 100, tsunami: 0, on: 0 },
//     { id: 4, name: 'EURUSD M5', load: 0, tsunami: 0, on: 0 },
//     { id: 5, name: 'EURUSD M5', load: 52, tsunami: 0, on: 0 },
//     { id: 6, name: 'EURUSD M5', load: null, tsunami: null, on: 1 },
// ]

// for (let i = 7; i < 50; i++) {
//     db_rigs.push(
//         { id: i, name: 'EURUSD M5', load: getRandomInt(0, 100), tsunami: getRandomInt(0, 2), on: 0 }
//     )
// }

const PortfolioMonitoring = () => {
    const [rigs, setRigs] = useState({})
    const [system, setSystem] = useState(false)
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [dateTime, setDateTime] = useState({})

    const content_height = 460;

    const backend = new Backend()


    useEffect(() => {
        onRequest()
        const updateTimer = setInterval(onRequest, 5000)
        return (() => {
            clearInterval(updateTimer)
        })
    }, [])

    const onRequest = () => {
        backend.getMonitoring()
            .then(res => {
                setError(false)
                const { on, date, time, rigs } = res
                setSystem(Boolean(on))
                if (rigs && rigs.length > 0) {
                    setLoading(false)
                    setRigs(rigs)
                    setDateTime({ date, time })
                }
            })
            .catch(() => {
                setError(true)
                setDateTime({ date: '', time: '' })
                setSystem(false)
                setLoading(true)
            })
    }

    const system_status = system ? 'System On' : 'System Off'
    const system_status_class = `system-status-wrapper ${system ? 'bc_lb' : 'bc_red'}`
    const content = (
        <>
            <View content_height={content_height} rigs={rigs} />
            <div className="monitoring-content__footer">
                <Tsunami rigs={rigs} />
                <OnOff rigs={rigs} />
            </div>
        </>
    )
    return (
        <>
            <div className="menu">
                <div className="menu-header">
                    <div className={system_status_class}>{system_status}</div>
                    <div className="menu-header1">{"Portfolio <NAME> Monitoring System"}</div>
                </div>
                <DateTime dateTime={dateTime} />
            </div>
            <div className="monitoring-content">
                <div className="monitoring-content__container"
                >
                    {error ? <ErrorMessage /> : loading ? <Spinner /> : content}
                </div>
            </div>
        </>
    )
}


export default PortfolioMonitoring;
