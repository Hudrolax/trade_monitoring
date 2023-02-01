import './DateTime.scss'

const DateTime = (props) => {
    const {date, time} = props.dateTime
    return (
        <div className='datetime-wrapper'>
            <div className="date">{`Date: ${date}`}</div>
            <div className="date">{`Time: ${time}`}</div>
        </div>
    )
}

export default DateTime;