import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';

@observer export default class Draggable extends React.Component {
	static propTypes = {
		minX: PropTypes.number, // minimalna wartość przesunięcia w lewo/prawo
		minY: PropTypes.number, // minimalna wartość przesunięcia w górę/dół
		scrollVertical: PropTypes.bool, // czy umożliwić scroll w pionie
		scrollHorizontal: PropTypes.bool, // czy umiżliwić scroll w poziomie
		onDragStart: PropTypes.func, // callback - start przesuwania
		onDragStop: PropTypes.func, // callback - koniec przesuwania
		onDragMove: PropTypes.func // callback - przesuwanie
	};
	static defaultProps = {
		x: 0,
		y: 0,
		minX: 0,
		minY: 0,
		scrollVertical: true,
		scrollHorizontal: true
	};

	constructor(props) {
		super(props);
		this.state = {
			data: {
				x: props.x,
				y: props.y
			},
			dragging: false
		};
	}

	dragRect = {
		start: {x: 0, y: 0},
		current: {x: 0, y: 0},
	};

	/**
	 * Dodaj zdarzenia ruchu myszką poza obiektem draggable
	 */
	componentDidMount() {
		window.addEventListener('mouseup', this.mouseUpHandle.bind(this));
		window.addEventListener('mousemove', this.mouseMoveHandle.bind(this));
	}

	/**
	 * Usuń zbędne zdarzenia ruchu myszką poza obiektem draggable
	 */
	componentWillUnmount() {
		window.removeEventListener('mouseup', this.mouseUpHandle.bind(this));
		window.removeEventListener('mousemove', this.mouseMoveHandle.bind(this));
	}

	/**
	 * Callback puszczenia klawisza myszki
	 */
	mouseUpHandle(e) {
		if (this.state.dragging) {
			this.state.dragging = false;
			this.setState(this.state);
			this.state.data.x = this.dragRect.current.x;
			this.state.data.y = this.dragRect.current.y;
			if (typeof this.props.onDragStop === 'function') {
				this.props.onDragStop(e, this.element, this.state, this.dragRect);
			}
		}
	}

	/**
	 * Callback kliknięcia klawisza myszki w polu draggable
	 */
	mouseDownHandle(e) {
		if (!this.state.dragging) {
			this.state.dragging = true;
			this.setState(this.state);
			this.dragRect.current.x = this.state.data.x;
			this.dragRect.current.y = this.state.data.y;
			this.dragRect.start.x = e.clientX;
			this.dragRect.start.y = e.clientY;
			e.preventDefault();
			if (typeof this.props.onDragStart === 'function') {
				this.props.onDragStart(e, this.element, this.state, this.dragRect);
			}
		}
	}

	/**
	 * Callback poruszania myszką
	 */
	mouseMoveHandle(e) {
		if (this.state.dragging) {
			this.dragScroll(this.state.data.x - (this.dragRect.start.x - e.clientX), this.state.data.y - (this.dragRect.start.y + e.clientY));
			if (typeof this.props.onDragMove === 'function') {
				this.props.onDragMove(e, this.element, this.state, this.dragRect);
			}
		}
	}

	/**
	 * Wyliczanie pozycji potomka
	 */
	dragScroll(x, y) {
		let child = this.element.getElementsByClassName("draggable-child");
		if (child.length) {
			if (this.props.scrollHorizontal && child[0].scrollWidth > this.element.offsetWidth) {
				x = Math.min(this.props.minX, x);
				x = Math.max(-child[0].scrollWidth + this.element.offsetWidth, x);
				this.dragRect.current.x = x;
				child[0].style.left = x + "px";
			} else if (this.props.scrollHorizontal && child[0].scrollWidth <= this.element.offsetWidth) {
				child[0].style.left = 0 + "px";
			} else {
				child[0].style.left = this.dragRect.current.x + "px";
			}
			if (this.props.scrollVertical && child[0].scrollHeight > this.element.offsetHeight) {
				y = Math.min(this.props.minY, y);
				y = Math.max(-child[0].scrollHeight + this.element.offsetHeight, y);
				this.dragRect.current.y = y;
				child[0].style.top = y + "px";
			} else if (this.props.scrollVertical && child[0].scrollHeight <= this.element.offsetHeight) {
				child[0].style.top = 0 + "px";
			} else {
				child[0].style.top = this.dragRect.current.y + "px";
			}
		}
	}

	/**
	 * RENDER
	 */
	render() {
		return <div className={this.props.className + " draggable-container"}
		            onMouseDown={this.mouseDownHandle.bind(this)} onMouseMove={this.mouseMoveHandle.bind(this)}
		            ref={element => {
			            this.element = element
		            }}>
			<div className="draggable-child" style={{left: this.state.data.x + "px", top: this.state.data.y + "px"}}>
				{this.props.children}
			</div>
		</div>;
	}
}