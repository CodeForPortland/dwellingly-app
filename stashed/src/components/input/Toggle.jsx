
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Toggle extends Component {
  constructor(props) {
    super(props);

    this.handleToggle = this.handleToggle.bind(this);

    this.state = {
      toggle: this.props.value
    };
  }

  handleToggle() {
    this.setState(
      ({ toggle }) => ({
        toggle: !toggle
      }),
      () => {
        this.props.onToggle(this.props.model, this.state.toggle);
      }
    );
  }

  render() {
    const { blockClass, id, label } = this.props;
    return (
      <label htmlFor={id} className="inline-input__toggle">
        <span className={`${blockClass}__label`}>{label}</span>
        <div className="switch">
          <input
            type="checkbox"
            onChange={this.handleToggle}
            checked={this.state.toggle}
            id={id}
          />
          <button
            aria-label="Checkbox toggle"
            className="switch__btn"
            onClick={this.handleToggle}
            type="button"
          />
        </div>
      </label>
    );
  }
}

Toggle.propTypes = {
  blockClass: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  model: PropTypes.string,
  onToggle: PropTypes.func,
  value: PropTypes.bool
};

Toggle.defaultProps = {
  model: undefined,
  onToggle: () => {},
  value: false
};

export default Toggle;
