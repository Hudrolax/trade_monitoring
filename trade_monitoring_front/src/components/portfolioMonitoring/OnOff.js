import './OnOff.scss'

const OnOff = (props) => {
    const rigs = props.rigs

    if (!(rigs && Object.keys(rigs).length)) {
        return
    }
    const content = [
        rigs.map(rig => {
            const isRed = !rig.on ? ' OnOff_block__red' : ''
            return (
                <div key={rig.id} className={`OnOff_block ${isRed}`}></div>
            )
        })
    ]
    return (
        <div className="OnOff-wrapper">
            <div className="OnOff">
                {content}
            </div>
            <div className='label'>
                <span className='green'>On</span>
                <span>/</span>
                <span className='red'>Off</span>
            </div>
        </div>
    )
}

export default OnOff;