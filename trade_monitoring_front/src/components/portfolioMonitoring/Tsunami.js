import './Tsunami.scss'

const Tsunami = (props) => {
    const { rigs } = props

    if (!(rigs && Object.keys(rigs).length)) {
        return
    }
    const content = [
        rigs.map(rig => {
            const isTsunami = rig.tsunami ? ' tsunami_block__red' : ''
            return (
                <div key={rig.id} className={`tsunami_block ${isTsunami}`}></div>
            )
        })
    ]
    return (
        <div className="tsunami-wrapper">
            <div className="tsunami">
                {content}
            </div>
            <div className='label'>
                <span>Tsunami</span>
            </div>
        </div>
    )
}

export default Tsunami;