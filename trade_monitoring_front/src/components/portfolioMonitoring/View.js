import { useState } from 'react';
import Hover from '../hover/Hover';
import './View.scss'


const View = (props) => {
    const [hoverRig, setHover] = useState(null)
    const cell_h = (props.content_height - 22) / 20;
    const rigs = props.rigs

    const displayHover = (rig) => {
        setHover(rig)
    }

    const hideHover = () => {
        setHover(null)
    }


    let grid = []
    if (!(rigs && Object.keys(rigs).length)) {
        return
    }
    for (let rig of rigs) {
        let cell = []
        for (let i = 0; i < 20; i++) {
            if (rig.load != null && rig.load < i * 5) {
                break
            }
            const add = rig.load === null ? ' cell__black' : rig.load === 0 ? ' cell__white' : ''
            cell.push(
                <div key={i} className={`cell c${i + 1}${add}`}
                    style={{
                        height: cell_h,
                    }}>
                    {/* {i * 5} */}
                </div>
            )
            if (rig.load === null) {
                break
            }
        }

        const hoverContent = hoverRig === rig ? <Hover name={rig.name} /> : ''

        grid.push(
            <div key={rig.id} className='column-wrapper'
                onPointerEnter={() => { displayHover(rig) }}
                onPointerLeave={hideHover}
            >
                <div className="column-header">
                    {rig.id}
                </div>
                <div className="column-body">
                    {cell}
                </div>
                {hoverContent}
            </div>
        )
    }

    return (
        <>
            <div className="grid-container">
                {grid}
                <div className="hline hline_75"></div>
                <div className="hline hline_50 "></div>
                <div className="hline hline_25"></div>
                <div className="percent percent_100">100%</div>
                <div className="percent percent_75">75%</div>
                <div className="percent percent_50">50%</div>
                <div className="percent percent_25">25%</div>
                <div className="percent percent_0">0%</div>
            </div>
        </>
    )
}

export default View;