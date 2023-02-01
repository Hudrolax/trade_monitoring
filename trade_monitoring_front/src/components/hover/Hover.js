import './Hover.scss'

const Hover = (props) => {
    return (
        <div className="hover-window">
            <span>{props.name ? props.name : 'Off'}</span>
        </div>
    )
}

export default Hover;