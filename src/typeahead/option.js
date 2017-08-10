var React = require('react');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
var classNames = require('classnames');

/**
 * A single option within the TypeaheadSelector
 */
var TypeaheadOption = createReactClass({
  propTypes: {
    customClasses: PropTypes.object,
    customValue: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.string,
    hover: PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      customClasses: {},
      onClick: function(event) {
        event.preventDefault();
      }
    };
  },

  render: function() {
    var classes = {};
    classes[this.props.customClasses.hover || "hover"] = !!this.props.hover;
    classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;

    if (this.props.customValue) {
      classes[this.props.customClasses.customAdd] = !!this.props.customClasses.customAdd;
    }

    var classList = classNames(classes);

    return (
      <li className={classList} onClick={this._onClick}>
        <a href="javascript: void 0;" className={this._getClasses()} ref="anchor">
          { this.props.children }
        </a>
      </li>
    );
  },

  _getClasses: function() {
    var classes = {
      "typeahead-option": true,
    };
    classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;

    return classNames(classes);
  },

  _onClick: function(event) {
    event.preventDefault();
    return this.props.onClick(event);
  }
});


module.exports = TypeaheadOption;
