!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.ReactTypeahead=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

function classNames() {
	var classes = '';
	var arg;

	for (var i = 0; i < arguments.length; i++) {
		arg = arguments[i];
		if (!arg) {
			continue;
		}

		if ('string' === typeof arg || 'number' === typeof arg) {
			classes += ' ' + arg;
		} else if (Object.prototype.toString.call(arg) === '[object Array]') {
			classes += ' ' + classNames.apply(null, arg);
		} else if ('object' === typeof arg) {
			for (var key in arg) {
				if (!arg.hasOwnProperty(key) || !arg[key]) {
					continue;
				}
				classes += ' ' + key;
			}
		}
	}
	return classes.substr(1);
}

// safely export classNames for node / browserify
if (typeof module !== 'undefined' && module.exports) {
	module.exports = classNames;
}

// safely export classNames for RequireJS
if (typeof define !== 'undefined' && define.amd) {
	define('classnames', [], function() {
		return classNames;
	});
}

},{}],2:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

var _assign = require('object-assign');

var emptyObject = require('fbjs/lib/emptyObject');
var _invariant = require('fbjs/lib/invariant');

if ("dev" !== 'production') {
  var warning = require('fbjs/lib/warning');
}

var MIXINS_KEY = 'mixins';

// Helper function to allow the creation of anonymous functions which do not
// have .name set to the name of the variable being assigned to.
function identity(fn) {
  return fn;
}

var ReactPropTypeLocationNames;
if ("dev" !== 'production') {
  ReactPropTypeLocationNames = {
    prop: 'prop',
    context: 'context',
    childContext: 'child context'
  };
} else {
  ReactPropTypeLocationNames = {};
}

function factory(ReactComponent, isValidElement, ReactNoopUpdateQueue) {
  /**
   * Policies that describe methods in `ReactClassInterface`.
   */

  var injectedMixins = [];

  /**
   * Composite components are higher-level components that compose other composite
   * or host components.
   *
   * To create a new type of `ReactClass`, pass a specification of
   * your new class to `React.createClass`. The only requirement of your class
   * specification is that you implement a `render` method.
   *
   *   var MyComponent = React.createClass({
   *     render: function() {
   *       return <div>Hello World</div>;
   *     }
   *   });
   *
   * The class specification supports a specific protocol of methods that have
   * special meaning (e.g. `render`). See `ReactClassInterface` for
   * more the comprehensive protocol. Any other properties and methods in the
   * class specification will be available on the prototype.
   *
   * @interface ReactClassInterface
   * @internal
   */
  var ReactClassInterface = {
    /**
     * An array of Mixin objects to include when defining your component.
     *
     * @type {array}
     * @optional
     */
    mixins: 'DEFINE_MANY',

    /**
     * An object containing properties and methods that should be defined on
     * the component's constructor instead of its prototype (static methods).
     *
     * @type {object}
     * @optional
     */
    statics: 'DEFINE_MANY',

    /**
     * Definition of prop types for this component.
     *
     * @type {object}
     * @optional
     */
    propTypes: 'DEFINE_MANY',

    /**
     * Definition of context types for this component.
     *
     * @type {object}
     * @optional
     */
    contextTypes: 'DEFINE_MANY',

    /**
     * Definition of context types this component sets for its children.
     *
     * @type {object}
     * @optional
     */
    childContextTypes: 'DEFINE_MANY',

    // ==== Definition methods ====

    /**
     * Invoked when the component is mounted. Values in the mapping will be set on
     * `this.props` if that prop is not specified (i.e. using an `in` check).
     *
     * This method is invoked before `getInitialState` and therefore cannot rely
     * on `this.state` or use `this.setState`.
     *
     * @return {object}
     * @optional
     */
    getDefaultProps: 'DEFINE_MANY_MERGED',

    /**
     * Invoked once before the component is mounted. The return value will be used
     * as the initial value of `this.state`.
     *
     *   getInitialState: function() {
     *     return {
     *       isOn: false,
     *       fooBaz: new BazFoo()
     *     }
     *   }
     *
     * @return {object}
     * @optional
     */
    getInitialState: 'DEFINE_MANY_MERGED',

    /**
     * @return {object}
     * @optional
     */
    getChildContext: 'DEFINE_MANY_MERGED',

    /**
     * Uses props from `this.props` and state from `this.state` to render the
     * structure of the component.
     *
     * No guarantees are made about when or how often this method is invoked, so
     * it must not have side effects.
     *
     *   render: function() {
     *     var name = this.props.name;
     *     return <div>Hello, {name}!</div>;
     *   }
     *
     * @return {ReactComponent}
     * @required
     */
    render: 'DEFINE_ONCE',

    // ==== Delegate methods ====

    /**
     * Invoked when the component is initially created and about to be mounted.
     * This may have side effects, but any external subscriptions or data created
     * by this method must be cleaned up in `componentWillUnmount`.
     *
     * @optional
     */
    componentWillMount: 'DEFINE_MANY',

    /**
     * Invoked when the component has been mounted and has a DOM representation.
     * However, there is no guarantee that the DOM node is in the document.
     *
     * Use this as an opportunity to operate on the DOM when the component has
     * been mounted (initialized and rendered) for the first time.
     *
     * @param {DOMElement} rootNode DOM element representing the component.
     * @optional
     */
    componentDidMount: 'DEFINE_MANY',

    /**
     * Invoked before the component receives new props.
     *
     * Use this as an opportunity to react to a prop transition by updating the
     * state using `this.setState`. Current props are accessed via `this.props`.
     *
     *   componentWillReceiveProps: function(nextProps, nextContext) {
     *     this.setState({
     *       likesIncreasing: nextProps.likeCount > this.props.likeCount
     *     });
     *   }
     *
     * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
     * transition may cause a state change, but the opposite is not true. If you
     * need it, you are probably looking for `componentWillUpdate`.
     *
     * @param {object} nextProps
     * @optional
     */
    componentWillReceiveProps: 'DEFINE_MANY',

    /**
     * Invoked while deciding if the component should be updated as a result of
     * receiving new props, state and/or context.
     *
     * Use this as an opportunity to `return false` when you're certain that the
     * transition to the new props/state/context will not require a component
     * update.
     *
     *   shouldComponentUpdate: function(nextProps, nextState, nextContext) {
     *     return !equal(nextProps, this.props) ||
     *       !equal(nextState, this.state) ||
     *       !equal(nextContext, this.context);
     *   }
     *
     * @param {object} nextProps
     * @param {?object} nextState
     * @param {?object} nextContext
     * @return {boolean} True if the component should update.
     * @optional
     */
    shouldComponentUpdate: 'DEFINE_ONCE',

    /**
     * Invoked when the component is about to update due to a transition from
     * `this.props`, `this.state` and `this.context` to `nextProps`, `nextState`
     * and `nextContext`.
     *
     * Use this as an opportunity to perform preparation before an update occurs.
     *
     * NOTE: You **cannot** use `this.setState()` in this method.
     *
     * @param {object} nextProps
     * @param {?object} nextState
     * @param {?object} nextContext
     * @param {ReactReconcileTransaction} transaction
     * @optional
     */
    componentWillUpdate: 'DEFINE_MANY',

    /**
     * Invoked when the component's DOM representation has been updated.
     *
     * Use this as an opportunity to operate on the DOM when the component has
     * been updated.
     *
     * @param {object} prevProps
     * @param {?object} prevState
     * @param {?object} prevContext
     * @param {DOMElement} rootNode DOM element representing the component.
     * @optional
     */
    componentDidUpdate: 'DEFINE_MANY',

    /**
     * Invoked when the component is about to be removed from its parent and have
     * its DOM representation destroyed.
     *
     * Use this as an opportunity to deallocate any external resources.
     *
     * NOTE: There is no `componentDidUnmount` since your component will have been
     * destroyed by that point.
     *
     * @optional
     */
    componentWillUnmount: 'DEFINE_MANY',

    // ==== Advanced methods ====

    /**
     * Updates the component's currently mounted DOM representation.
     *
     * By default, this implements React's rendering and reconciliation algorithm.
     * Sophisticated clients may wish to override this.
     *
     * @param {ReactReconcileTransaction} transaction
     * @internal
     * @overridable
     */
    updateComponent: 'OVERRIDE_BASE'
  };

  /**
   * Mapping from class specification keys to special processing functions.
   *
   * Although these are declared like instance properties in the specification
   * when defining classes using `React.createClass`, they are actually static
   * and are accessible on the constructor instead of the prototype. Despite
   * being static, they must be defined outside of the "statics" key under
   * which all other static methods are defined.
   */
  var RESERVED_SPEC_KEYS = {
    displayName: function(Constructor, displayName) {
      Constructor.displayName = displayName;
    },
    mixins: function(Constructor, mixins) {
      if (mixins) {
        for (var i = 0; i < mixins.length; i++) {
          mixSpecIntoComponent(Constructor, mixins[i]);
        }
      }
    },
    childContextTypes: function(Constructor, childContextTypes) {
      if ("dev" !== 'production') {
        validateTypeDef(Constructor, childContextTypes, 'childContext');
      }
      Constructor.childContextTypes = _assign(
        {},
        Constructor.childContextTypes,
        childContextTypes
      );
    },
    contextTypes: function(Constructor, contextTypes) {
      if ("dev" !== 'production') {
        validateTypeDef(Constructor, contextTypes, 'context');
      }
      Constructor.contextTypes = _assign(
        {},
        Constructor.contextTypes,
        contextTypes
      );
    },
    /**
     * Special case getDefaultProps which should move into statics but requires
     * automatic merging.
     */
    getDefaultProps: function(Constructor, getDefaultProps) {
      if (Constructor.getDefaultProps) {
        Constructor.getDefaultProps = createMergedResultFunction(
          Constructor.getDefaultProps,
          getDefaultProps
        );
      } else {
        Constructor.getDefaultProps = getDefaultProps;
      }
    },
    propTypes: function(Constructor, propTypes) {
      if ("dev" !== 'production') {
        validateTypeDef(Constructor, propTypes, 'prop');
      }
      Constructor.propTypes = _assign({}, Constructor.propTypes, propTypes);
    },
    statics: function(Constructor, statics) {
      mixStaticSpecIntoComponent(Constructor, statics);
    },
    autobind: function() {}
  };

  function validateTypeDef(Constructor, typeDef, location) {
    for (var propName in typeDef) {
      if (typeDef.hasOwnProperty(propName)) {
        // use a warning instead of an _invariant so components
        // don't show up in prod but only in __DEV__
        if ("dev" !== 'production') {
          warning(
            typeof typeDef[propName] === 'function',
            '%s: %s type `%s` is invalid; it must be a function, usually from ' +
              'React.PropTypes.',
            Constructor.displayName || 'ReactClass',
            ReactPropTypeLocationNames[location],
            propName
          );
        }
      }
    }
  }

  function validateMethodOverride(isAlreadyDefined, name) {
    var specPolicy = ReactClassInterface.hasOwnProperty(name)
      ? ReactClassInterface[name]
      : null;

    // Disallow overriding of base class methods unless explicitly allowed.
    if (ReactClassMixin.hasOwnProperty(name)) {
      _invariant(
        specPolicy === 'OVERRIDE_BASE',
        'ReactClassInterface: You are attempting to override ' +
          '`%s` from your class specification. Ensure that your method names ' +
          'do not overlap with React methods.',
        name
      );
    }

    // Disallow defining methods more than once unless explicitly allowed.
    if (isAlreadyDefined) {
      _invariant(
        specPolicy === 'DEFINE_MANY' || specPolicy === 'DEFINE_MANY_MERGED',
        'ReactClassInterface: You are attempting to define ' +
          '`%s` on your component more than once. This conflict may be due ' +
          'to a mixin.',
        name
      );
    }
  }

  /**
   * Mixin helper which handles policy validation and reserved
   * specification keys when building React classes.
   */
  function mixSpecIntoComponent(Constructor, spec) {
    if (!spec) {
      if ("dev" !== 'production') {
        var typeofSpec = typeof spec;
        var isMixinValid = typeofSpec === 'object' && spec !== null;

        if ("dev" !== 'production') {
          warning(
            isMixinValid,
            "%s: You're attempting to include a mixin that is either null " +
              'or not an object. Check the mixins included by the component, ' +
              'as well as any mixins they include themselves. ' +
              'Expected object but got %s.',
            Constructor.displayName || 'ReactClass',
            spec === null ? null : typeofSpec
          );
        }
      }

      return;
    }

    _invariant(
      typeof spec !== 'function',
      "ReactClass: You're attempting to " +
        'use a component class or function as a mixin. Instead, just use a ' +
        'regular object.'
    );
    _invariant(
      !isValidElement(spec),
      "ReactClass: You're attempting to " +
        'use a component as a mixin. Instead, just use a regular object.'
    );

    var proto = Constructor.prototype;
    var autoBindPairs = proto.__reactAutoBindPairs;

    // By handling mixins before any other properties, we ensure the same
    // chaining order is applied to methods with DEFINE_MANY policy, whether
    // mixins are listed before or after these methods in the spec.
    if (spec.hasOwnProperty(MIXINS_KEY)) {
      RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
    }

    for (var name in spec) {
      if (!spec.hasOwnProperty(name)) {
        continue;
      }

      if (name === MIXINS_KEY) {
        // We have already handled mixins in a special case above.
        continue;
      }

      var property = spec[name];
      var isAlreadyDefined = proto.hasOwnProperty(name);
      validateMethodOverride(isAlreadyDefined, name);

      if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
        RESERVED_SPEC_KEYS[name](Constructor, property);
      } else {
        // Setup methods on prototype:
        // The following member methods should not be automatically bound:
        // 1. Expected ReactClass methods (in the "interface").
        // 2. Overridden methods (that were mixed in).
        var isReactClassMethod = ReactClassInterface.hasOwnProperty(name);
        var isFunction = typeof property === 'function';
        var shouldAutoBind =
          isFunction &&
          !isReactClassMethod &&
          !isAlreadyDefined &&
          spec.autobind !== false;

        if (shouldAutoBind) {
          autoBindPairs.push(name, property);
          proto[name] = property;
        } else {
          if (isAlreadyDefined) {
            var specPolicy = ReactClassInterface[name];

            // These cases should already be caught by validateMethodOverride.
            _invariant(
              isReactClassMethod &&
                (specPolicy === 'DEFINE_MANY_MERGED' ||
                  specPolicy === 'DEFINE_MANY'),
              'ReactClass: Unexpected spec policy %s for key %s ' +
                'when mixing in component specs.',
              specPolicy,
              name
            );

            // For methods which are defined more than once, call the existing
            // methods before calling the new property, merging if appropriate.
            if (specPolicy === 'DEFINE_MANY_MERGED') {
              proto[name] = createMergedResultFunction(proto[name], property);
            } else if (specPolicy === 'DEFINE_MANY') {
              proto[name] = createChainedFunction(proto[name], property);
            }
          } else {
            proto[name] = property;
            if ("dev" !== 'production') {
              // Add verbose displayName to the function, which helps when looking
              // at profiling tools.
              if (typeof property === 'function' && spec.displayName) {
                proto[name].displayName = spec.displayName + '_' + name;
              }
            }
          }
        }
      }
    }
  }

  function mixStaticSpecIntoComponent(Constructor, statics) {
    if (!statics) {
      return;
    }
    for (var name in statics) {
      var property = statics[name];
      if (!statics.hasOwnProperty(name)) {
        continue;
      }

      var isReserved = name in RESERVED_SPEC_KEYS;
      _invariant(
        !isReserved,
        'ReactClass: You are attempting to define a reserved ' +
          'property, `%s`, that shouldn\'t be on the "statics" key. Define it ' +
          'as an instance property instead; it will still be accessible on the ' +
          'constructor.',
        name
      );

      var isInherited = name in Constructor;
      _invariant(
        !isInherited,
        'ReactClass: You are attempting to define ' +
          '`%s` on your component more than once. This conflict may be ' +
          'due to a mixin.',
        name
      );
      Constructor[name] = property;
    }
  }

  /**
   * Merge two objects, but throw if both contain the same key.
   *
   * @param {object} one The first object, which is mutated.
   * @param {object} two The second object
   * @return {object} one after it has been mutated to contain everything in two.
   */
  function mergeIntoWithNoDuplicateKeys(one, two) {
    _invariant(
      one && two && typeof one === 'object' && typeof two === 'object',
      'mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.'
    );

    for (var key in two) {
      if (two.hasOwnProperty(key)) {
        _invariant(
          one[key] === undefined,
          'mergeIntoWithNoDuplicateKeys(): ' +
            'Tried to merge two objects with the same key: `%s`. This conflict ' +
            'may be due to a mixin; in particular, this may be caused by two ' +
            'getInitialState() or getDefaultProps() methods returning objects ' +
            'with clashing keys.',
          key
        );
        one[key] = two[key];
      }
    }
    return one;
  }

  /**
   * Creates a function that invokes two functions and merges their return values.
   *
   * @param {function} one Function to invoke first.
   * @param {function} two Function to invoke second.
   * @return {function} Function that invokes the two argument functions.
   * @private
   */
  function createMergedResultFunction(one, two) {
    return function mergedResult() {
      var a = one.apply(this, arguments);
      var b = two.apply(this, arguments);
      if (a == null) {
        return b;
      } else if (b == null) {
        return a;
      }
      var c = {};
      mergeIntoWithNoDuplicateKeys(c, a);
      mergeIntoWithNoDuplicateKeys(c, b);
      return c;
    };
  }

  /**
   * Creates a function that invokes two functions and ignores their return vales.
   *
   * @param {function} one Function to invoke first.
   * @param {function} two Function to invoke second.
   * @return {function} Function that invokes the two argument functions.
   * @private
   */
  function createChainedFunction(one, two) {
    return function chainedFunction() {
      one.apply(this, arguments);
      two.apply(this, arguments);
    };
  }

  /**
   * Binds a method to the component.
   *
   * @param {object} component Component whose method is going to be bound.
   * @param {function} method Method to be bound.
   * @return {function} The bound method.
   */
  function bindAutoBindMethod(component, method) {
    var boundMethod = method.bind(component);
    if ("dev" !== 'production') {
      boundMethod.__reactBoundContext = component;
      boundMethod.__reactBoundMethod = method;
      boundMethod.__reactBoundArguments = null;
      var componentName = component.constructor.displayName;
      var _bind = boundMethod.bind;
      boundMethod.bind = function(newThis) {
        for (
          var _len = arguments.length,
            args = Array(_len > 1 ? _len - 1 : 0),
            _key = 1;
          _key < _len;
          _key++
        ) {
          args[_key - 1] = arguments[_key];
        }

        // User is trying to bind() an autobound method; we effectively will
        // ignore the value of "this" that the user is trying to use, so
        // let's warn.
        if (newThis !== component && newThis !== null) {
          if ("dev" !== 'production') {
            warning(
              false,
              'bind(): React component methods may only be bound to the ' +
                'component instance. See %s',
              componentName
            );
          }
        } else if (!args.length) {
          if ("dev" !== 'production') {
            warning(
              false,
              'bind(): You are binding a component method to the component. ' +
                'React does this for you automatically in a high-performance ' +
                'way, so you can safely remove this call. See %s',
              componentName
            );
          }
          return boundMethod;
        }
        var reboundMethod = _bind.apply(boundMethod, arguments);
        reboundMethod.__reactBoundContext = component;
        reboundMethod.__reactBoundMethod = method;
        reboundMethod.__reactBoundArguments = args;
        return reboundMethod;
      };
    }
    return boundMethod;
  }

  /**
   * Binds all auto-bound methods in a component.
   *
   * @param {object} component Component whose method is going to be bound.
   */
  function bindAutoBindMethods(component) {
    var pairs = component.__reactAutoBindPairs;
    for (var i = 0; i < pairs.length; i += 2) {
      var autoBindKey = pairs[i];
      var method = pairs[i + 1];
      component[autoBindKey] = bindAutoBindMethod(component, method);
    }
  }

  var IsMountedPreMixin = {
    componentDidMount: function() {
      this.__isMounted = true;
    }
  };

  var IsMountedPostMixin = {
    componentWillUnmount: function() {
      this.__isMounted = false;
    }
  };

  /**
   * Add more to the ReactClass base class. These are all legacy features and
   * therefore not already part of the modern ReactComponent.
   */
  var ReactClassMixin = {
    /**
     * TODO: This will be deprecated because state should always keep a consistent
     * type signature and the only use case for this, is to avoid that.
     */
    replaceState: function(newState, callback) {
      this.updater.enqueueReplaceState(this, newState, callback);
    },

    /**
     * Checks whether or not this composite component is mounted.
     * @return {boolean} True if mounted, false otherwise.
     * @protected
     * @final
     */
    isMounted: function() {
      if ("dev" !== 'production') {
        warning(
          this.__didWarnIsMounted,
          '%s: isMounted is deprecated. Instead, make sure to clean up ' +
            'subscriptions and pending requests in componentWillUnmount to ' +
            'prevent memory leaks.',
          (this.constructor && this.constructor.displayName) ||
            this.name ||
            'Component'
        );
        this.__didWarnIsMounted = true;
      }
      return !!this.__isMounted;
    }
  };

  var ReactClassComponent = function() {};
  _assign(
    ReactClassComponent.prototype,
    ReactComponent.prototype,
    ReactClassMixin
  );

  /**
   * Creates a composite component class given a class specification.
   * See https://facebook.github.io/react/docs/top-level-api.html#react.createclass
   *
   * @param {object} spec Class specification (which must define `render`).
   * @return {function} Component constructor function.
   * @public
   */
  function createClass(spec) {
    // To keep our warnings more understandable, we'll use a little hack here to
    // ensure that Constructor.name !== 'Constructor'. This makes sure we don't
    // unnecessarily identify a class without displayName as 'Constructor'.
    var Constructor = identity(function(props, context, updater) {
      // This constructor gets overridden by mocks. The argument is used
      // by mocks to assert on what gets mounted.

      if ("dev" !== 'production') {
        warning(
          this instanceof Constructor,
          'Something is calling a React component directly. Use a factory or ' +
            'JSX instead. See: https://fb.me/react-legacyfactory'
        );
      }

      // Wire up auto-binding
      if (this.__reactAutoBindPairs.length) {
        bindAutoBindMethods(this);
      }

      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;

      this.state = null;

      // ReactClasses doesn't have constructors. Instead, they use the
      // getInitialState and componentWillMount methods for initialization.

      var initialState = this.getInitialState ? this.getInitialState() : null;
      if ("dev" !== 'production') {
        // We allow auto-mocks to proceed as if they're returning null.
        if (
          initialState === undefined &&
          this.getInitialState._isMockFunction
        ) {
          // This is probably bad practice. Consider warning here and
          // deprecating this convenience.
          initialState = null;
        }
      }
      _invariant(
        typeof initialState === 'object' && !Array.isArray(initialState),
        '%s.getInitialState(): must return an object or null',
        Constructor.displayName || 'ReactCompositeComponent'
      );

      this.state = initialState;
    });
    Constructor.prototype = new ReactClassComponent();
    Constructor.prototype.constructor = Constructor;
    Constructor.prototype.__reactAutoBindPairs = [];

    injectedMixins.forEach(mixSpecIntoComponent.bind(null, Constructor));

    mixSpecIntoComponent(Constructor, IsMountedPreMixin);
    mixSpecIntoComponent(Constructor, spec);
    mixSpecIntoComponent(Constructor, IsMountedPostMixin);

    // Initialize the defaultProps property after all mixins have been merged.
    if (Constructor.getDefaultProps) {
      Constructor.defaultProps = Constructor.getDefaultProps();
    }

    if ("dev" !== 'production') {
      // This is a tag to indicate that the use of these method names is ok,
      // since it's used with createClass. If it's not, then it's likely a
      // mistake so we'll warn you to use the static property, property
      // initializer or constructor respectively.
      if (Constructor.getDefaultProps) {
        Constructor.getDefaultProps.isReactClassApproved = {};
      }
      if (Constructor.prototype.getInitialState) {
        Constructor.prototype.getInitialState.isReactClassApproved = {};
      }
    }

    _invariant(
      Constructor.prototype.render,
      'createClass(...): Class specification must implement a `render` method.'
    );

    if ("dev" !== 'production') {
      warning(
        !Constructor.prototype.componentShouldUpdate,
        '%s has a method called ' +
          'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' +
          'The name is phrased as a question because the function is ' +
          'expected to return a value.',
        spec.displayName || 'A component'
      );
      warning(
        !Constructor.prototype.componentWillRecieveProps,
        '%s has a method called ' +
          'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?',
        spec.displayName || 'A component'
      );
    }

    // Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in ReactClassInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }

    return Constructor;
  }

  return createClass;
}

module.exports = factory;

},{"fbjs/lib/emptyObject":5,"fbjs/lib/invariant":6,"fbjs/lib/warning":7,"object-assign":9}],3:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

var React = require('react');
var factory = require('./factory');

if (typeof React === 'undefined') {
  throw Error(
    'create-react-class could not find the React object. If you are using script tags, ' +
      'make sure that React is being loaded before create-react-class.'
  );
}

// Hack to grab NoopUpdateQueue from isomorphic React
var ReactNoopUpdateQueue = new React.Component().updater;

module.exports = factory(
  React.Component,
  React.isValidElement,
  ReactNoopUpdateQueue
);

},{"./factory":2,"react":"react"}],4:[function(require,module,exports){
"use strict";

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;
},{}],5:[function(require,module,exports){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

var emptyObject = {};

if ("dev" !== 'production') {
  Object.freeze(emptyObject);
}

module.exports = emptyObject;
},{}],6:[function(require,module,exports){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if ("dev" !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
},{}],7:[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

var emptyFunction = require('./emptyFunction');

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if ("dev" !== 'production') {
  var printWarning = function printWarning(format) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argIndex = 0;
    var message = 'Warning: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    });
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  warning = function warning(condition, format) {
    if (format === undefined) {
      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
    }

    if (format.indexOf('Failed Composite propType: ') === 0) {
      return; // Ignore CompositeComponent proptype check.
    }

    if (!condition) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      printWarning.apply(undefined, [format].concat(args));
    }
  };
}

module.exports = warning;
},{"./emptyFunction":4}],8:[function(require,module,exports){
/*
 * Fuzzy
 * https://github.com/myork/fuzzy
 *
 * Copyright (c) 2012 Matt York
 * Licensed under the MIT license.
 */

(function() {

var root = this;

var fuzzy = {};

// Use in node or in browser
if (typeof exports !== 'undefined') {
  module.exports = fuzzy;
} else {
  root.fuzzy = fuzzy;
}

// Return all elements of `array` that have a fuzzy
// match against `pattern`.
fuzzy.simpleFilter = function(pattern, array) {
  return array.filter(function(str) {
    return fuzzy.test(pattern, str);
  });
};

// Does `pattern` fuzzy match `str`?
fuzzy.test = function(pattern, str) {
  return fuzzy.match(pattern, str) !== null;
};

// If `pattern` matches `str`, wrap each matching character
// in `opts.pre` and `opts.post`. If no match, return null
fuzzy.match = function(pattern, str, opts) {
  opts = opts || {};
  var patternIdx = 0
    , result = []
    , len = str.length
    , totalScore = 0
    , currScore = 0
    // prefix
    , pre = opts.pre || ''
    // suffix
    , post = opts.post || ''
    // String to compare against. This might be a lowercase version of the
    // raw string
    , compareString =  opts.caseSensitive && str || str.toLowerCase()
    , ch;

  pattern = opts.caseSensitive && pattern || pattern.toLowerCase();

  // For each character in the string, either add it to the result
  // or wrap in template if it's the next string in the pattern
  for(var idx = 0; idx < len; idx++) {
    ch = str[idx];
    if(compareString[idx] === pattern[patternIdx]) {
      ch = pre + ch + post;
      patternIdx += 1;

      // consecutive characters should increase the score more than linearly
      currScore += 1 + currScore;
    } else {
      currScore = 0;
    }
    totalScore += currScore;
    result[result.length] = ch;
  }

  // return rendered string if we have a match for every char
  if(patternIdx === pattern.length) {
    // if the string is an exact match with pattern, totalScore should be maxed
    totalScore = (compareString === pattern) ? Infinity : totalScore;
    return {rendered: result.join(''), score: totalScore};
  }

  return null;
};

// The normal entry point. Filters `arr` for matches against `pattern`.
// It returns an array with matching values of the type:
//
//     [{
//         string:   '<b>lah' // The rendered string
//       , index:    2        // The index of the element in `arr`
//       , original: 'blah'   // The original element in `arr`
//     }]
//
// `opts` is an optional argument bag. Details:
//
//    opts = {
//        // string to put before a matching character
//        pre:     '<b>'
//
//        // string to put after matching character
//      , post:    '</b>'
//
//        // Optional function. Input is an entry in the given arr`,
//        // output should be the string to test `pattern` against.
//        // In this example, if `arr = [{crying: 'koala'}]` we would return
//        // 'koala'.
//      , extract: function(arg) { return arg.crying; }
//    }
fuzzy.filter = function(pattern, arr, opts) {
  if(!arr || arr.length === 0) {
    return [];
  }
  if (typeof pattern !== 'string') {
    return arr;
  }
  opts = opts || {};
  return arr
    .reduce(function(prev, element, idx, arr) {
      var str = element;
      if(opts.extract) {
        str = opts.extract(element);
      }
      var rendered = fuzzy.match(pattern, str, opts);
      if(rendered != null) {
        prev[prev.length] = {
            string: rendered.rendered
          , score: rendered.score
          , index: idx
          , original: element
        };
      }
      return prev;
    }, [])

    // Sort by score. Browsers are inconsistent wrt stable/unstable
    // sorting, so force stable by using the index in the case of tie.
    // See http://ofb.net/~sethml/is-sort-stable.html
    .sort(function(a,b) {
      var compare = b.score - a.score;
      if(compare) return compare;
      return a.index - b.index;
    });
};


}());


},{}],9:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],10:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

if ("dev" !== 'production') {
  var invariant = require('fbjs/lib/invariant');
  var warning = require('fbjs/lib/warning');
  var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
  var loggedTypeFailures = {};
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if ("dev" !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          invariant(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', componentName || 'React class', location, typeSpecName);
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          warning(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
        }
      }
    }
  }
}

module.exports = checkPropTypes;

},{"./lib/ReactPropTypesSecret":14,"fbjs/lib/invariant":6,"fbjs/lib/warning":7}],11:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var emptyFunction = require('fbjs/lib/emptyFunction');
var invariant = require('fbjs/lib/invariant');
var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');

module.exports = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      // It is still safe when called from React.
      return;
    }
    invariant(
      false,
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

},{"./lib/ReactPropTypesSecret":14,"fbjs/lib/emptyFunction":4,"fbjs/lib/invariant":6}],12:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var emptyFunction = require('fbjs/lib/emptyFunction');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
var checkPropTypes = require('./checkPropTypes');

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if ("dev" !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          invariant(
            false,
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
        } else if ("dev" !== 'production' && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            warning(
              false,
              'You are manually calling a React.PropTypes validation ' +
              'function for the `%s` prop on `%s`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.',
              propFullName,
              componentName
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction.thatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      "dev" !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      "dev" !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        warning(
          false,
          'Invalid argument supplid to oneOfType. Expected an array of check functions, but ' +
          'received %s at index %s.',
          getPostfixForTypeWarning(checker),
          i
        );
        return emptyFunction.thatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

},{"./checkPropTypes":10,"./lib/ReactPropTypesSecret":14,"fbjs/lib/emptyFunction":4,"fbjs/lib/invariant":6,"fbjs/lib/warning":7}],13:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

if ("dev" !== 'production') {
  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
    Symbol.for &&
    Symbol.for('react.element')) ||
    0xeac7;

  var isValidElement = function(object) {
    return typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = require('./factoryWithTypeCheckers')(isValidElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = require('./factoryWithThrowingShims')();
}

},{"./factoryWithThrowingShims":11,"./factoryWithTypeCheckers":12}],14:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;

},{}],15:[function(require,module,exports){
var Accessor = {
  IDENTITY_FN: function (input) {
    return input;
  },

  generateAccessor: function (field) {
    return function (object) {
      return object[field];
    };
  },

  generateOptionToStringFor: function (prop) {
    if (typeof prop === 'string') {
      return this.generateAccessor(prop);
    } else if (typeof prop === 'function') {
      return prop;
    } else {
      return this.IDENTITY_FN;
    }
  },

  valueForOption: function (option, object) {
    if (typeof option === 'string') {
      return object[option];
    } else if (typeof option === 'function') {
      return option(object);
    } else {
      return object;
    }
  }
};

module.exports = Accessor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjY2Vzc29yLmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwiSURFTlRJVFlfRk4iLCJpbnB1dCIsImdlbmVyYXRlQWNjZXNzb3IiLCJmaWVsZCIsIm9iamVjdCIsImdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3IiLCJwcm9wIiwidmFsdWVGb3JPcHRpb24iLCJvcHRpb24iLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxXQUFXO0FBQ2JDLGVBQWEsVUFBU0MsS0FBVCxFQUFnQjtBQUFFLFdBQU9BLEtBQVA7QUFBZSxHQURqQzs7QUFHYkMsb0JBQWtCLFVBQVNDLEtBQVQsRUFBZ0I7QUFDaEMsV0FBTyxVQUFTQyxNQUFULEVBQWlCO0FBQUUsYUFBT0EsT0FBT0QsS0FBUCxDQUFQO0FBQXVCLEtBQWpEO0FBQ0QsR0FMWTs7QUFPYkUsNkJBQTJCLFVBQVNDLElBQVQsRUFBZTtBQUN4QyxRQUFJLE9BQU9BLElBQVAsS0FBZ0IsUUFBcEIsRUFBOEI7QUFDNUIsYUFBTyxLQUFLSixnQkFBTCxDQUFzQkksSUFBdEIsQ0FBUDtBQUNELEtBRkQsTUFFTyxJQUFJLE9BQU9BLElBQVAsS0FBZ0IsVUFBcEIsRUFBZ0M7QUFDckMsYUFBT0EsSUFBUDtBQUNELEtBRk0sTUFFQTtBQUNMLGFBQU8sS0FBS04sV0FBWjtBQUNEO0FBQ0YsR0FmWTs7QUFpQmJPLGtCQUFnQixVQUFTQyxNQUFULEVBQWlCSixNQUFqQixFQUF5QjtBQUN2QyxRQUFJLE9BQU9JLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDOUIsYUFBT0osT0FBT0ksTUFBUCxDQUFQO0FBQ0QsS0FGRCxNQUVPLElBQUksT0FBT0EsTUFBUCxLQUFrQixVQUF0QixFQUFrQztBQUN2QyxhQUFPQSxPQUFPSixNQUFQLENBQVA7QUFDRCxLQUZNLE1BRUE7QUFDTCxhQUFPQSxNQUFQO0FBQ0Q7QUFDRjtBQXpCWSxDQUFmOztBQTRCQUssT0FBT0MsT0FBUCxHQUFpQlgsUUFBakIiLCJmaWxlIjoiYWNjZXNzb3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQWNjZXNzb3IgPSB7XG4gIElERU5USVRZX0ZOOiBmdW5jdGlvbihpbnB1dCkgeyByZXR1cm4gaW5wdXQ7IH0sXG5cbiAgZ2VuZXJhdGVBY2Nlc3NvcjogZnVuY3Rpb24oZmllbGQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7IHJldHVybiBvYmplY3RbZmllbGRdOyB9O1xuICB9LFxuXG4gIGdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3I6IGZ1bmN0aW9uKHByb3ApIHtcbiAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZUFjY2Vzc29yKHByb3ApO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHByb3AgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBwcm9wO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5JREVOVElUWV9GTjtcbiAgICB9XG4gIH0sXG5cbiAgdmFsdWVGb3JPcHRpb246IGZ1bmN0aW9uKG9wdGlvbiwgb2JqZWN0KSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gb2JqZWN0W29wdGlvbl07XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gb3B0aW9uKG9iamVjdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBY2Nlc3NvcjtcbiJdfQ==
},{}],16:[function(require,module,exports){
/**
 * PolyFills make me sad
 */
var KeyEvent = KeyEvent || {};
KeyEvent.DOM_VK_UP = KeyEvent.DOM_VK_UP || 38;
KeyEvent.DOM_VK_DOWN = KeyEvent.DOM_VK_DOWN || 40;
KeyEvent.DOM_VK_BACK_SPACE = KeyEvent.DOM_VK_BACK_SPACE || 8;
KeyEvent.DOM_VK_RETURN = KeyEvent.DOM_VK_RETURN || 13;
KeyEvent.DOM_VK_ENTER = KeyEvent.DOM_VK_ENTER || 14;
KeyEvent.DOM_VK_ESCAPE = KeyEvent.DOM_VK_ESCAPE || 27;
KeyEvent.DOM_VK_TAB = KeyEvent.DOM_VK_TAB || 9;

module.exports = KeyEvent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtleWV2ZW50LmpzIl0sIm5hbWVzIjpbIktleUV2ZW50IiwiRE9NX1ZLX1VQIiwiRE9NX1ZLX0RPV04iLCJET01fVktfQkFDS19TUEFDRSIsIkRPTV9WS19SRVRVUk4iLCJET01fVktfRU5URVIiLCJET01fVktfRVNDQVBFIiwiRE9NX1ZLX1RBQiIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBOzs7QUFHQSxJQUFJQSxXQUFXQSxZQUFZLEVBQTNCO0FBQ0FBLFNBQVNDLFNBQVQsR0FBcUJELFNBQVNDLFNBQVQsSUFBc0IsRUFBM0M7QUFDQUQsU0FBU0UsV0FBVCxHQUF1QkYsU0FBU0UsV0FBVCxJQUF3QixFQUEvQztBQUNBRixTQUFTRyxpQkFBVCxHQUE2QkgsU0FBU0csaUJBQVQsSUFBOEIsQ0FBM0Q7QUFDQUgsU0FBU0ksYUFBVCxHQUF5QkosU0FBU0ksYUFBVCxJQUEwQixFQUFuRDtBQUNBSixTQUFTSyxZQUFULEdBQXdCTCxTQUFTSyxZQUFULElBQXlCLEVBQWpEO0FBQ0FMLFNBQVNNLGFBQVQsR0FBeUJOLFNBQVNNLGFBQVQsSUFBMEIsRUFBbkQ7QUFDQU4sU0FBU08sVUFBVCxHQUFzQlAsU0FBU08sVUFBVCxJQUF1QixDQUE3Qzs7QUFFQUMsT0FBT0MsT0FBUCxHQUFpQlQsUUFBakIiLCJmaWxlIjoia2V5ZXZlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFBvbHlGaWxscyBtYWtlIG1lIHNhZFxuICovXG52YXIgS2V5RXZlbnQgPSBLZXlFdmVudCB8fCB7fTtcbktleUV2ZW50LkRPTV9WS19VUCA9IEtleUV2ZW50LkRPTV9WS19VUCB8fCAzODtcbktleUV2ZW50LkRPTV9WS19ET1dOID0gS2V5RXZlbnQuRE9NX1ZLX0RPV04gfHwgNDA7XG5LZXlFdmVudC5ET01fVktfQkFDS19TUEFDRSA9IEtleUV2ZW50LkRPTV9WS19CQUNLX1NQQUNFIHx8IDg7XG5LZXlFdmVudC5ET01fVktfUkVUVVJOID0gS2V5RXZlbnQuRE9NX1ZLX1JFVFVSTiB8fCAxMztcbktleUV2ZW50LkRPTV9WS19FTlRFUiA9IEtleUV2ZW50LkRPTV9WS19FTlRFUiB8fCAxNDtcbktleUV2ZW50LkRPTV9WS19FU0NBUEUgPSBLZXlFdmVudC5ET01fVktfRVNDQVBFIHx8IDI3O1xuS2V5RXZlbnQuRE9NX1ZLX1RBQiA9IEtleUV2ZW50LkRPTV9WS19UQUIgfHwgOTtcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlFdmVudDtcbiJdfQ==
},{}],17:[function(require,module,exports){
var Typeahead = require('./typeahead');
var Tokenizer = require('./tokenizer');

module.exports = {
  Typeahead: Typeahead,
  Tokenizer: Tokenizer
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0LXR5cGVhaGVhZC5qcyJdLCJuYW1lcyI6WyJUeXBlYWhlYWQiLCJyZXF1aXJlIiwiVG9rZW5pemVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSUEsWUFBWUMsUUFBUSxhQUFSLENBQWhCO0FBQ0EsSUFBSUMsWUFBWUQsUUFBUSxhQUFSLENBQWhCOztBQUVBRSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZKLGFBQVdBLFNBREk7QUFFZkUsYUFBV0E7QUFGSSxDQUFqQiIsImZpbGUiOiJyZWFjdC10eXBlYWhlYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgVHlwZWFoZWFkID0gcmVxdWlyZSgnLi90eXBlYWhlYWQnKTtcbnZhciBUb2tlbml6ZXIgPSByZXF1aXJlKCcuL3Rva2VuaXplcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVHlwZWFoZWFkOiBUeXBlYWhlYWQsXG4gIFRva2VuaXplcjogVG9rZW5pemVyXG59O1xuIl19
},{"./tokenizer":18,"./typeahead":20}],18:[function(require,module,exports){
var Accessor = require('../accessor');
var React = window.React || require('react');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
var Token = require('./token');
var KeyEvent = require('../keyevent');
var Typeahead = require('../typeahead');
var classNames = require('classnames');

function _arraysAreDifferent(array1, array2) {
  if (array1.length != array2.length) {
    return true;
  }
  for (var i = array2.length - 1; i >= 0; i--) {
    if (array2[i] !== array1[i]) {
      return true;
    }
  }
}

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 */
var TypeaheadTokenizer = createReactClass({
  displayName: 'TypeaheadTokenizer',

  propTypes: {
    name: PropTypes.string,
    options: PropTypes.array,
    customClasses: PropTypes.object,
    allowCustomValues: PropTypes.number,
    defaultSelected: PropTypes.array,
    initialValue: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    inputProps: PropTypes.object,
    onTokenRemove: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyPress: PropTypes.func,
    onKeyUp: PropTypes.func,
    onTokenAdd: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    filterOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    displayOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    formInputOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    maxVisible: PropTypes.number,
    defaultClassNames: PropTypes.bool
  },

  getInitialState: function () {
    return {
      // We need to copy this to avoid incorrect sharing
      // of state across instances (e.g., via getDefaultProps())
      selected: this.props.defaultSelected.slice(0)
    };
  },

  getDefaultProps: function () {
    return {
      options: [],
      defaultSelected: [],
      customClasses: {},
      allowCustomValues: 0,
      initialValue: "",
      placeholder: "",
      disabled: false,
      inputProps: {},
      defaultClassNames: true,
      filterOption: null,
      displayOption: function (token) {
        return token;
      },
      formInputOption: null,
      onKeyDown: function (event) {},
      onKeyPress: function (event) {},
      onKeyUp: function (event) {},
      onFocus: function (event) {},
      onBlur: function (event) {},
      onTokenAdd: function () {},
      onTokenRemove: function () {}
    };
  },

  componentWillReceiveProps: function (nextProps) {
    // if we get new defaultProps, update selected
    if (_arraysAreDifferent(this.props.defaultSelected, nextProps.defaultSelected)) {
      this.setState({ selected: nextProps.defaultSelected.slice(0) });
    }
  },

  focus: function () {
    this.refs.typeahead.focus();
  },

  getSelectedTokens: function () {
    return this.state.selected;
  },

  // TODO: Support initialized tokens
  //
  _renderTokens: function () {
    var tokenClasses = {};
    tokenClasses[this.props.customClasses.token] = !!this.props.customClasses.token;
    var classList = classNames(tokenClasses);
    var result = this.state.selected.map(function (selected) {
      var displayString = Accessor.valueForOption(this.props.displayOption, selected);
      var value = Accessor.valueForOption(this.props.formInputOption || this.props.displayOption, selected);
      return React.createElement(
        Token,
        { key: displayString, className: classList,
          onRemove: this._removeTokenForValue,
          object: selected,
          value: value,
          name: this.props.name },
        displayString
      );
    }, this);
    return result;
  },

  _getOptionsForTypeahead: function () {
    // return this.props.options without this.selected
    return this.props.options;
  },

  _onKeyDown: function (event) {
    // We only care about intercepting backspaces
    if (event.keyCode === KeyEvent.DOM_VK_BACK_SPACE) {
      return this._handleBackspace(event);
    }
    this.props.onKeyDown(event);
  },

  _handleBackspace: function (event) {
    // No tokens
    if (!this.state.selected.length) {
      return;
    }

    // Remove token ONLY when bksp pressed at beginning of line
    // without a selection
    var entry = this.refs.typeahead.refs.entry;
    if (entry.selectionStart == entry.selectionEnd && entry.selectionStart == 0) {
      this._removeTokenForValue(this.state.selected[this.state.selected.length - 1]);
      event.preventDefault();
    }
  },

  _removeTokenForValue: function (value) {
    var index = this.state.selected.indexOf(value);
    if (index == -1) {
      return;
    }

    this.state.selected.splice(index, 1);
    this.setState({ selected: this.state.selected });
    this.props.onTokenRemove(value);
    return;
  },

  _addTokenForValue: function (value) {
    if (this.state.selected.indexOf(value) != -1) {
      return;
    }
    this.state.selected.push(value);
    this.setState({ selected: this.state.selected });
    this.refs.typeahead.setEntryText("");
    this.props.onTokenAdd(value);
  },

  render: function () {
    var classes = {};
    classes[this.props.customClasses.typeahead] = !!this.props.customClasses.typeahead;
    var classList = classNames(classes);
    var tokenizerClasses = [this.props.defaultClassNames && "typeahead-tokenizer"];
    tokenizerClasses[this.props.className] = !!this.props.className;
    var tokenizerClassList = classNames(tokenizerClasses);

    return React.createElement(
      'div',
      { className: tokenizerClassList },
      this._renderTokens(),
      React.createElement(Typeahead, { ref: 'typeahead',
        className: classList,
        placeholder: this.props.placeholder,
        disabled: this.props.disabled,
        inputProps: this.props.inputProps,
        allowCustomValues: this.props.allowCustomValues,
        customClasses: this.props.customClasses,
        options: this._getOptionsForTypeahead(),
        initialValue: this.props.initialValue,
        maxVisible: this.props.maxVisible,
        onOptionSelected: this._addTokenForValue,
        onKeyDown: this._onKeyDown,
        onKeyPress: this.props.onKeyPress,
        onKeyUp: this.props.onKeyUp,
        onFocus: this.props.onFocus,
        onBlur: this.props.onBlur,
        displayOption: this.props.displayOption,
        defaultClassNames: this.props.defaultClassNames,
        filterOption: this.props.filterOption })
    );
  }
});

module.exports = TypeaheadTokenizer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwicmVxdWlyZSIsIlJlYWN0IiwiUHJvcFR5cGVzIiwiY3JlYXRlUmVhY3RDbGFzcyIsIlRva2VuIiwiS2V5RXZlbnQiLCJUeXBlYWhlYWQiLCJjbGFzc05hbWVzIiwiX2FycmF5c0FyZURpZmZlcmVudCIsImFycmF5MSIsImFycmF5MiIsImxlbmd0aCIsImkiLCJUeXBlYWhlYWRUb2tlbml6ZXIiLCJwcm9wVHlwZXMiLCJuYW1lIiwic3RyaW5nIiwib3B0aW9ucyIsImFycmF5IiwiY3VzdG9tQ2xhc3NlcyIsIm9iamVjdCIsImFsbG93Q3VzdG9tVmFsdWVzIiwibnVtYmVyIiwiZGVmYXVsdFNlbGVjdGVkIiwiaW5pdGlhbFZhbHVlIiwicGxhY2Vob2xkZXIiLCJkaXNhYmxlZCIsImJvb2wiLCJpbnB1dFByb3BzIiwib25Ub2tlblJlbW92ZSIsImZ1bmMiLCJvbktleURvd24iLCJvbktleVByZXNzIiwib25LZXlVcCIsIm9uVG9rZW5BZGQiLCJvbkZvY3VzIiwib25CbHVyIiwiZmlsdGVyT3B0aW9uIiwib25lT2ZUeXBlIiwiZGlzcGxheU9wdGlvbiIsImZvcm1JbnB1dE9wdGlvbiIsIm1heFZpc2libGUiLCJkZWZhdWx0Q2xhc3NOYW1lcyIsImdldEluaXRpYWxTdGF0ZSIsInNlbGVjdGVkIiwicHJvcHMiLCJzbGljZSIsImdldERlZmF1bHRQcm9wcyIsInRva2VuIiwiZXZlbnQiLCJjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwibmV4dFByb3BzIiwic2V0U3RhdGUiLCJmb2N1cyIsInJlZnMiLCJ0eXBlYWhlYWQiLCJnZXRTZWxlY3RlZFRva2VucyIsInN0YXRlIiwiX3JlbmRlclRva2VucyIsInRva2VuQ2xhc3NlcyIsImNsYXNzTGlzdCIsInJlc3VsdCIsIm1hcCIsImRpc3BsYXlTdHJpbmciLCJ2YWx1ZUZvck9wdGlvbiIsInZhbHVlIiwiX3JlbW92ZVRva2VuRm9yVmFsdWUiLCJfZ2V0T3B0aW9uc0ZvclR5cGVhaGVhZCIsIl9vbktleURvd24iLCJrZXlDb2RlIiwiRE9NX1ZLX0JBQ0tfU1BBQ0UiLCJfaGFuZGxlQmFja3NwYWNlIiwiZW50cnkiLCJzZWxlY3Rpb25TdGFydCIsInNlbGVjdGlvbkVuZCIsInByZXZlbnREZWZhdWx0IiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwiX2FkZFRva2VuRm9yVmFsdWUiLCJwdXNoIiwic2V0RW50cnlUZXh0IiwicmVuZGVyIiwiY2xhc3NlcyIsInRva2VuaXplckNsYXNzZXMiLCJjbGFzc05hbWUiLCJ0b2tlbml6ZXJDbGFzc0xpc3QiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxXQUFXQyxRQUFRLGFBQVIsQ0FBZjtBQUNBLElBQUlDLFFBQVFELFFBQVEsT0FBUixDQUFaO0FBQ0EsSUFBSUUsWUFBWUYsUUFBUSxZQUFSLENBQWhCO0FBQ0EsSUFBSUcsbUJBQW1CSCxRQUFRLG9CQUFSLENBQXZCO0FBQ0EsSUFBSUksUUFBUUosUUFBUSxTQUFSLENBQVo7QUFDQSxJQUFJSyxXQUFXTCxRQUFRLGFBQVIsQ0FBZjtBQUNBLElBQUlNLFlBQVlOLFFBQVEsY0FBUixDQUFoQjtBQUNBLElBQUlPLGFBQWFQLFFBQVEsWUFBUixDQUFqQjs7QUFFQSxTQUFTUSxtQkFBVCxDQUE2QkMsTUFBN0IsRUFBcUNDLE1BQXJDLEVBQTZDO0FBQzNDLE1BQUlELE9BQU9FLE1BQVAsSUFBaUJELE9BQU9DLE1BQTVCLEVBQW1DO0FBQ2pDLFdBQU8sSUFBUDtBQUNEO0FBQ0QsT0FBSyxJQUFJQyxJQUFJRixPQUFPQyxNQUFQLEdBQWdCLENBQTdCLEVBQWdDQyxLQUFLLENBQXJDLEVBQXdDQSxHQUF4QyxFQUE2QztBQUMzQyxRQUFJRixPQUFPRSxDQUFQLE1BQWNILE9BQU9HLENBQVAsQ0FBbEIsRUFBNEI7QUFDMUIsYUFBTyxJQUFQO0FBQ0Q7QUFDRjtBQUNGOztBQUVEOzs7OztBQUtBLElBQUlDLHFCQUFxQlYsaUJBQWlCO0FBQUE7O0FB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O0FBUUUsc0JBQWMsS0FBS3RCLEtBQUwsQ0FBV3JCLFlBUjNCO0FBU0Usb0JBQVksS0FBS3FCLEtBQUwsQ0FBV0osVUFUekI7QUFVRSwwQkFBa0IsS0FBS3NDLGlCQVZ6QjtBQVdFLG1CQUFXLEtBQUtYLFVBWGxCO0FBWUUsb0JBQVksS0FBS3ZCLEtBQUwsQ0FBV2IsVUFaekI7QUFhRSxpQkFBUyxLQUFLYSxLQUFMLENBQVdaLE9BYnRCO0FBY0UsaUJBQVMsS0FBS1ksS0FBTCxDQUFXVixPQWR0QjtBQWVFLGdCQUFRLEtBQUtVLEtBQUwsQ0FBV1QsTUFmckI7QUFnQkUsdUJBQWUsS0FBS1MsS0FBTCxDQUFXTixhQWhCNUI7QUFpQkUsMkJBQW1CLEtBQUtNLEtBQUwsQ0FBV0gsaUJBakJoQztBQWtCRSxzQkFBYyxLQUFLRyxLQUFMLENBQVdSLFlBbEIzQjtBQUZGLEtBREY7QUF3QkQ7QUEzTHVDLENBQWpCLENBQXpCOztBQThMQWtELE9BQU9DLE9BQVAsR0FBaUIzRSxrQkFBakIiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQWNjZXNzb3IgPSByZXF1aXJlKCcuLi9hY2Nlc3NvcicpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG52YXIgY3JlYXRlUmVhY3RDbGFzcyA9IHJlcXVpcmUoJ2NyZWF0ZS1yZWFjdC1jbGFzcycpO1xudmFyIFRva2VuID0gcmVxdWlyZSgnLi90b2tlbicpO1xudmFyIEtleUV2ZW50ID0gcmVxdWlyZSgnLi4va2V5ZXZlbnQnKTtcbnZhciBUeXBlYWhlYWQgPSByZXF1aXJlKCcuLi90eXBlYWhlYWQnKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5mdW5jdGlvbiBfYXJyYXlzQXJlRGlmZmVyZW50KGFycmF5MSwgYXJyYXkyKSB7XG4gIGlmIChhcnJheTEubGVuZ3RoICE9IGFycmF5Mi5sZW5ndGgpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGZvciAodmFyIGkgPSBhcnJheTIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoYXJyYXkyW2ldICE9PSBhcnJheTFbaV0pe1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQSB0eXBlYWhlYWQgdGhhdCwgd2hlbiBhbiBvcHRpb24gaXMgc2VsZWN0ZWQsIGluc3RlYWQgb2Ygc2ltcGx5IGZpbGxpbmdcbiAqIHRoZSB0ZXh0IGVudHJ5IHdpZGdldCwgcHJlcGVuZHMgYSByZW5kZXJhYmxlIFwidG9rZW5cIiwgdGhhdCBtYXkgYmUgZGVsZXRlZFxuICogYnkgcHJlc3NpbmcgYmFja3NwYWNlIG9uIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUgd2l0aCB0aGUga2V5Ym9hcmQuXG4gKi9cbnZhciBUeXBlYWhlYWRUb2tlbml6ZXIgPSBjcmVhdGVSZWFjdENsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgbmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBvcHRpb25zOiBQcm9wVHlwZXMuYXJyYXksXG4gICAgY3VzdG9tQ2xhc3NlczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBhbGxvd0N1c3RvbVZhbHVlczogUHJvcFR5cGVzLm51bWJlcixcbiAgICBkZWZhdWx0U2VsZWN0ZWQ6IFByb3BUeXBlcy5hcnJheSxcbiAgICBpbml0aWFsVmFsdWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgcGxhY2Vob2xkZXI6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIGlucHV0UHJvcHM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgb25Ub2tlblJlbW92ZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25LZXlEb3duOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbktleVByZXNzOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbktleVVwOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvblRva2VuQWRkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkZvY3VzOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkJsdXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIGZpbHRlck9wdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgUHJvcFR5cGVzLmZ1bmNcbiAgICBdKSxcbiAgICBkaXNwbGF5T3B0aW9uOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICBQcm9wVHlwZXMuZnVuY1xuICAgIF0pLFxuICAgIGZvcm1JbnB1dE9wdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgUHJvcFR5cGVzLmZ1bmNcbiAgICBdKSxcbiAgICBtYXhWaXNpYmxlOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIGRlZmF1bHRDbGFzc05hbWVzOiBQcm9wVHlwZXMuYm9vbFxuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFdlIG5lZWQgdG8gY29weSB0aGlzIHRvIGF2b2lkIGluY29ycmVjdCBzaGFyaW5nXG4gICAgICAvLyBvZiBzdGF0ZSBhY3Jvc3MgaW5zdGFuY2VzIChlLmcuLCB2aWEgZ2V0RGVmYXVsdFByb3BzKCkpXG4gICAgICBzZWxlY3RlZDogdGhpcy5wcm9wcy5kZWZhdWx0U2VsZWN0ZWQuc2xpY2UoMClcbiAgICB9O1xuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9wdGlvbnM6IFtdLFxuICAgICAgZGVmYXVsdFNlbGVjdGVkOiBbXSxcbiAgICAgIGN1c3RvbUNsYXNzZXM6IHt9LFxuICAgICAgYWxsb3dDdXN0b21WYWx1ZXM6IDAsXG4gICAgICBpbml0aWFsVmFsdWU6IFwiXCIsXG4gICAgICBwbGFjZWhvbGRlcjogXCJcIixcbiAgICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICAgIGlucHV0UHJvcHM6IHt9LFxuICAgICAgZGVmYXVsdENsYXNzTmFtZXM6IHRydWUsXG4gICAgICBmaWx0ZXJPcHRpb246IG51bGwsXG4gICAgICBkaXNwbGF5T3B0aW9uOiBmdW5jdGlvbih0b2tlbil7IHJldHVybiB0b2tlbiB9LFxuICAgICAgZm9ybUlucHV0T3B0aW9uOiBudWxsLFxuICAgICAgb25LZXlEb3duOiBmdW5jdGlvbihldmVudCkge30sXG4gICAgICBvbktleVByZXNzOiBmdW5jdGlvbihldmVudCkge30sXG4gICAgICBvbktleVVwOiBmdW5jdGlvbihldmVudCkge30sXG4gICAgICBvbkZvY3VzOiBmdW5jdGlvbihldmVudCkge30sXG4gICAgICBvbkJsdXI6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uVG9rZW5BZGQ6IGZ1bmN0aW9uKCkge30sXG4gICAgICBvblRva2VuUmVtb3ZlOiBmdW5jdGlvbigpIHt9XG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpe1xuICAgIC8vIGlmIHdlIGdldCBuZXcgZGVmYXVsdFByb3BzLCB1cGRhdGUgc2VsZWN0ZWRcbiAgICBpZiAoX2FycmF5c0FyZURpZmZlcmVudCh0aGlzLnByb3BzLmRlZmF1bHRTZWxlY3RlZCwgbmV4dFByb3BzLmRlZmF1bHRTZWxlY3RlZCkpe1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWQ6IG5leHRQcm9wcy5kZWZhdWx0U2VsZWN0ZWQuc2xpY2UoMCl9KVxuICAgIH1cbiAgfSxcblxuICBmb2N1czogZnVuY3Rpb24oKXtcbiAgICB0aGlzLnJlZnMudHlwZWFoZWFkLmZvY3VzKCk7XG4gIH0sXG5cbiAgZ2V0U2VsZWN0ZWRUb2tlbnM6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuc2VsZWN0ZWQ7XG4gIH0sXG5cbiAgLy8gVE9ETzogU3VwcG9ydCBpbml0aWFsaXplZCB0b2tlbnNcbiAgLy9cbiAgX3JlbmRlclRva2VuczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRva2VuQ2xhc3NlcyA9IHt9O1xuICAgIHRva2VuQ2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMudG9rZW5dID0gISF0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMudG9rZW47XG4gICAgdmFyIGNsYXNzTGlzdCA9IGNsYXNzTmFtZXModG9rZW5DbGFzc2VzKTtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZC5tYXAoZnVuY3Rpb24oc2VsZWN0ZWQpIHtcbiAgICAgIHZhciBkaXNwbGF5U3RyaW5nID0gQWNjZXNzb3IudmFsdWVGb3JPcHRpb24odGhpcy5wcm9wcy5kaXNwbGF5T3B0aW9uLCBzZWxlY3RlZCk7XG4gICAgICB2YXIgdmFsdWUgPSBBY2Nlc3Nvci52YWx1ZUZvck9wdGlvbih0aGlzLnByb3BzLmZvcm1JbnB1dE9wdGlvbiB8fCB0aGlzLnByb3BzLmRpc3BsYXlPcHRpb24sIHNlbGVjdGVkKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxUb2tlbiBrZXk9eyBkaXNwbGF5U3RyaW5nIH0gY2xhc3NOYW1lPXtjbGFzc0xpc3R9XG4gICAgICAgICAgb25SZW1vdmU9eyB0aGlzLl9yZW1vdmVUb2tlbkZvclZhbHVlIH1cbiAgICAgICAgICBvYmplY3Q9e3NlbGVjdGVkfVxuICAgICAgICAgIHZhbHVlPXt2YWx1ZX1cbiAgICAgICAgICBuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH0+XG4gICAgICAgICAgeyBkaXNwbGF5U3RyaW5nIH1cbiAgICAgICAgPC9Ub2tlbj5cbiAgICAgICk7XG4gICAgfSwgdGhpcyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcblxuICBfZ2V0T3B0aW9uc0ZvclR5cGVhaGVhZDogZnVuY3Rpb24oKSB7XG4gICAgLy8gcmV0dXJuIHRoaXMucHJvcHMub3B0aW9ucyB3aXRob3V0IHRoaXMuc2VsZWN0ZWRcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vcHRpb25zO1xuICB9LFxuXG4gIF9vbktleURvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gV2Ugb25seSBjYXJlIGFib3V0IGludGVyY2VwdGluZyBiYWNrc3BhY2VzXG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IEtleUV2ZW50LkRPTV9WS19CQUNLX1NQQUNFKSB7XG4gICAgICByZXR1cm4gdGhpcy5faGFuZGxlQmFja3NwYWNlKGV2ZW50KTtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vbktleURvd24oZXZlbnQpO1xuICB9LFxuXG4gIF9oYW5kbGVCYWNrc3BhY2U6IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAvLyBObyB0b2tlbnNcbiAgICBpZiAoIXRoaXMuc3RhdGUuc2VsZWN0ZWQubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRva2VuIE9OTFkgd2hlbiBia3NwIHByZXNzZWQgYXQgYmVnaW5uaW5nIG9mIGxpbmVcbiAgICAvLyB3aXRob3V0IGEgc2VsZWN0aW9uXG4gICAgdmFyIGVudHJ5ID0gdGhpcy5yZWZzLnR5cGVhaGVhZC5yZWZzLmVudHJ5O1xuICAgIGlmIChlbnRyeS5zZWxlY3Rpb25TdGFydCA9PSBlbnRyeS5zZWxlY3Rpb25FbmQgJiZcbiAgICAgICAgZW50cnkuc2VsZWN0aW9uU3RhcnQgPT0gMCkge1xuICAgICAgdGhpcy5fcmVtb3ZlVG9rZW5Gb3JWYWx1ZShcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFt0aGlzLnN0YXRlLnNlbGVjdGVkLmxlbmd0aCAtIDFdKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9LFxuXG4gIF9yZW1vdmVUb2tlbkZvclZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWQuaW5kZXhPZih2YWx1ZSk7XG4gICAgaWYgKGluZGV4ID09IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZS5zZWxlY3RlZC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkfSk7XG4gICAgdGhpcy5wcm9wcy5vblRva2VuUmVtb3ZlKHZhbHVlKTtcbiAgICByZXR1cm47XG4gIH0sXG5cbiAgX2FkZFRva2VuRm9yVmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWQuaW5kZXhPZih2YWx1ZSkgIT0gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZS5zZWxlY3RlZC5wdXNoKHZhbHVlKTtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZDogdGhpcy5zdGF0ZS5zZWxlY3RlZH0pO1xuICAgIHRoaXMucmVmcy50eXBlYWhlYWQuc2V0RW50cnlUZXh0KFwiXCIpO1xuICAgIHRoaXMucHJvcHMub25Ub2tlbkFkZCh2YWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xhc3NlcyA9IHt9O1xuICAgIGNsYXNzZXNbdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLnR5cGVhaGVhZF0gPSAhIXRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy50eXBlYWhlYWQ7XG4gICAgdmFyIGNsYXNzTGlzdCA9IGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG4gICAgdmFyIHRva2VuaXplckNsYXNzZXMgPSBbdGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lcyAmJiBcInR5cGVhaGVhZC10b2tlbml6ZXJcIl07XG4gICAgdG9rZW5pemVyQ2xhc3Nlc1t0aGlzLnByb3BzLmNsYXNzTmFtZV0gPSAhIXRoaXMucHJvcHMuY2xhc3NOYW1lO1xuICAgIHZhciB0b2tlbml6ZXJDbGFzc0xpc3QgPSBjbGFzc05hbWVzKHRva2VuaXplckNsYXNzZXMpXG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e3Rva2VuaXplckNsYXNzTGlzdH0+XG4gICAgICAgIHsgdGhpcy5fcmVuZGVyVG9rZW5zKCkgfVxuICAgICAgICA8VHlwZWFoZWFkIHJlZj1cInR5cGVhaGVhZFwiXG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc0xpc3R9XG4gICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9XG4gICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9XG4gICAgICAgICAgaW5wdXRQcm9wcz17dGhpcy5wcm9wcy5pbnB1dFByb3BzfVxuICAgICAgICAgIGFsbG93Q3VzdG9tVmFsdWVzPXt0aGlzLnByb3BzLmFsbG93Q3VzdG9tVmFsdWVzfVxuICAgICAgICAgIGN1c3RvbUNsYXNzZXM9e3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlc31cbiAgICAgICAgICBvcHRpb25zPXt0aGlzLl9nZXRPcHRpb25zRm9yVHlwZWFoZWFkKCl9XG4gICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnByb3BzLmluaXRpYWxWYWx1ZX1cbiAgICAgICAgICBtYXhWaXNpYmxlPXt0aGlzLnByb3BzLm1heFZpc2libGV9XG4gICAgICAgICAgb25PcHRpb25TZWxlY3RlZD17dGhpcy5fYWRkVG9rZW5Gb3JWYWx1ZX1cbiAgICAgICAgICBvbktleURvd249e3RoaXMuX29uS2V5RG93bn1cbiAgICAgICAgICBvbktleVByZXNzPXt0aGlzLnByb3BzLm9uS2V5UHJlc3N9XG4gICAgICAgICAgb25LZXlVcD17dGhpcy5wcm9wcy5vbktleVVwfVxuICAgICAgICAgIG9uRm9jdXM9e3RoaXMucHJvcHMub25Gb2N1c31cbiAgICAgICAgICBvbkJsdXI9e3RoaXMucHJvcHMub25CbHVyfVxuICAgICAgICAgIGRpc3BsYXlPcHRpb249e3RoaXMucHJvcHMuZGlzcGxheU9wdGlvbn1cbiAgICAgICAgICBkZWZhdWx0Q2xhc3NOYW1lcz17dGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lc31cbiAgICAgICAgICBmaWx0ZXJPcHRpb249e3RoaXMucHJvcHMuZmlsdGVyT3B0aW9ufSAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHlwZWFoZWFkVG9rZW5pemVyO1xuIl19
},{"../accessor":15,"../keyevent":16,"../typeahead":20,"./token":19,"classnames":1,"create-react-class":3,"prop-types":13,"react":"react"}],19:[function(require,module,exports){
var React = window.React || require('react');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
var classNames = require('classnames');

/**
 * Encapsulates the rendering of an option that has been "selected" in a
 * TypeaheadTokenizer
 */
var Token = createReactClass({
  displayName: 'Token',

  propTypes: {
    className: PropTypes.string,
    name: PropTypes.string,
    children: PropTypes.string,
    object: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onRemove: PropTypes.func,
    value: PropTypes.string
  },

  render: function () {
    var className = classNames(["typeahead-token", this.props.className]);

    return React.createElement(
      'div',
      { className: className },
      this._renderHiddenInput(),
      this.props.children,
      this._renderCloseButton()
    );
  },

  _renderHiddenInput: function () {
    // If no name was set, don't create a hidden input
    if (!this.props.name) {
      return null;
    }

    return React.createElement('input', {
      type: 'hidden',
      name: this.props.name + '[]',
      value: this.props.value || this.props.object
    });
  },

  _renderCloseButton: function () {
    if (!this.props.onRemove) {
      return "";
    }
    return React.createElement(
      'a',
      { className: 'typeahead-token-close', href: '#', onClick: function (event) {
          this.props.onRemove(this.props.object);
          event.preventDefault();
        }.bind(this) },
      '\xD7'
    );
  }
});

module.exports = Token;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRva2VuLmpzIl0sIm5hbWVzIjpbIlJlYWN0IiwicmVxdWlyZSIsIlByb3BUeXBlcyIsImNyZWF0ZVJlYWN0Q2xhc3MiLCJjbGFzc05hbWVzIiwiVG9rZW4iLCJwcm9wVHlwZXMiLCJjbGFzc05hbWUiLCJzdHJpbmciLCJuYW1lIiwiY2hpbGRyZW4iLCJvYmplY3QiLCJvbmVPZlR5cGUiLCJvblJlbW92ZSIsImZ1bmMiLCJ2YWx1ZSIsInJlbmRlciIsInByb3BzIiwiX3JlbmRlckhpZGRlbklucHV0IiwiX3JlbmRlckNsb3NlQnV0dG9uIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsImJpbmQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxRQUFRQyxRQUFRLE9BQVIsQ0FBWjtBQUNBLElBQUlDLFlBQVlELFFBQVEsWUFBUixDQUFoQjtBQUNBLElBQUlFLG1CQUFtQkYsUUFBUSxvQkFBUixDQUF2QjtBQUNBLElBQUlHLGFBQWFILFFBQVEsWUFBUixDQUFqQjs7QUFFQTs7OztBQUlBLElBQUlJLFFBQVFGLGlCQUFpQjtBQUFBOztBQUMzQkcsYUFBVztBQUNUQyxlQUFXTCxVQUFVTSxNQURaO0FBRVRDLFVBQU1QLFVBQVVNLE1BRlA7QUFHVEUsY0FBVVIsVUFBVU0sTUFIWDtBQUlURyxZQUFRVCxVQUFVVSxTQUFWLENBQW9CLENBQzFCVixVQUFVTSxNQURnQixFQUUxQk4sVUFBVVMsTUFGZ0IsQ0FBcEIsQ0FKQztBQVFURSxjQUFVWCxVQUFVWSxJQVJYO0FBU1RDLFdBQU9iLFVBQVVNO0FBVFIsR0FEZ0I7O0FBYTNCUSxVQUFRLFlBQVc7QUFDakIsUUFBSVQsWUFBWUgsV0FBVyxDQUN6QixpQkFEeUIsRUFFekIsS0FBS2EsS0FBTCxDQUFXVixTQUZjLENBQVgsQ0FBaEI7O0FBS0EsV0FDRTtBQUFBO0FBQUEsUUFBSyxXQUFXQSxTQUFoQjtBQUNHLFdBQUtXLGtCQUFMLEVBREg7QUFFRyxXQUFLRCxLQUFMLENBQVdQLFFBRmQ7QUFHRyxXQUFLUyxrQkFBTDtBQUhILEtBREY7QUFPRCxHQTFCMEI7O0FBNEIzQkQsc0JBQW9CLFlBQVc7QUFDN0I7QUFDQSxRQUFJLENBQUMsS0FBS0QsS0FBTCxDQUFXUixJQUFoQixFQUFzQjtBQUNwQixhQUFPLElBQVA7QUFDRDs7QUFFRCxXQUNFO0FBQ0UsWUFBSyxRQURQO0FBRUUsWUFBTyxLQUFLUSxLQUFMLENBQVdSLElBQVgsR0FBa0IsSUFGM0I7QUFHRSxhQUFRLEtBQUtRLEtBQUwsQ0FBV0YsS0FBWCxJQUFvQixLQUFLRSxLQUFMLENBQVdOO0FBSHpDLE1BREY7QUFPRCxHQXpDMEI7O0FBMkMzQlEsc0JBQW9CLFlBQVc7QUFDN0IsUUFBSSxDQUFDLEtBQUtGLEtBQUwsQ0FBV0osUUFBaEIsRUFBMEI7QUFDeEIsYUFBTyxFQUFQO0FBQ0Q7QUFDRCxXQUNFO0FBQUE7QUFBQSxRQUFHLFdBQVUsdUJBQWIsRUFBcUMsTUFBSyxHQUExQyxFQUE4QyxTQUFTLFVBQVNPLEtBQVQsRUFBZ0I7QUFDbkUsZUFBS0gsS0FBTCxDQUFXSixRQUFYLENBQW9CLEtBQUtJLEtBQUwsQ0FBV04sTUFBL0I7QUFDQVMsZ0JBQU1DLGNBQU47QUFDRCxTQUhvRCxDQUduREMsSUFIbUQsQ0FHOUMsSUFIOEMsQ0FBdkQ7QUFBQTtBQUFBLEtBREY7QUFNRDtBQXJEMEIsQ0FBakIsQ0FBWjs7QUF3REFDLE9BQU9DLE9BQVAsR0FBaUJuQixLQUFqQiIsImZpbGUiOiJ0b2tlbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xudmFyIGNyZWF0ZVJlYWN0Q2xhc3MgPSByZXF1aXJlKCdjcmVhdGUtcmVhY3QtY2xhc3MnKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyB0aGUgcmVuZGVyaW5nIG9mIGFuIG9wdGlvbiB0aGF0IGhhcyBiZWVuIFwic2VsZWN0ZWRcIiBpbiBhXG4gKiBUeXBlYWhlYWRUb2tlbml6ZXJcbiAqL1xudmFyIFRva2VuID0gY3JlYXRlUmVhY3RDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGNoaWxkcmVuOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG9iamVjdDogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgUHJvcFR5cGVzLm9iamVjdCxcbiAgICBdKSxcbiAgICBvblJlbW92ZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgdmFsdWU6IFByb3BUeXBlcy5zdHJpbmdcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjbGFzc05hbWUgPSBjbGFzc05hbWVzKFtcbiAgICAgIFwidHlwZWFoZWFkLXRva2VuXCIsXG4gICAgICB0aGlzLnByb3BzLmNsYXNzTmFtZVxuICAgIF0pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWV9PlxuICAgICAgICB7dGhpcy5fcmVuZGVySGlkZGVuSW5wdXQoKX1cbiAgICAgICAge3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgICAgIHt0aGlzLl9yZW5kZXJDbG9zZUJ1dHRvbigpfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcblxuICBfcmVuZGVySGlkZGVuSW5wdXQ6IGZ1bmN0aW9uKCkge1xuICAgIC8vIElmIG5vIG5hbWUgd2FzIHNldCwgZG9uJ3QgY3JlYXRlIGEgaGlkZGVuIGlucHV0XG4gICAgaWYgKCF0aGlzLnByb3BzLm5hbWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8aW5wdXRcbiAgICAgICAgdHlwZT1cImhpZGRlblwiXG4gICAgICAgIG5hbWU9eyB0aGlzLnByb3BzLm5hbWUgKyAnW10nIH1cbiAgICAgICAgdmFsdWU9eyB0aGlzLnByb3BzLnZhbHVlIHx8IHRoaXMucHJvcHMub2JqZWN0IH1cbiAgICAgIC8+XG4gICAgKTtcbiAgfSxcblxuICBfcmVuZGVyQ2xvc2VCdXR0b246IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5wcm9wcy5vblJlbW92ZSkge1xuICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8YSBjbGFzc05hbWU9XCJ0eXBlYWhlYWQtdG9rZW4tY2xvc2VcIiBocmVmPVwiI1wiIG9uQ2xpY2s9e2Z1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5vblJlbW92ZSh0aGlzLnByb3BzLm9iamVjdCk7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpfT4mI3gwMGQ3OzwvYT5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUb2tlbjtcbiJdfQ==
},{"classnames":1,"create-react-class":3,"prop-types":13,"react":"react"}],20:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Accessor = require('../accessor');
var React = window.React || require('react');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
var TypeaheadSelector = require('./selector');
var KeyEvent = require('../keyevent');
var fuzzy = require('fuzzy');
var classNames = require('classnames');

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
var Typeahead = createReactClass({
  displayName: 'Typeahead',

  propTypes: {
    name: PropTypes.string,
    customClasses: PropTypes.object,
    maxVisible: PropTypes.number,
    options: PropTypes.array,
    allowCustomValues: PropTypes.number,
    initialValue: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    textarea: PropTypes.bool,
    inputProps: PropTypes.object,
    onOptionSelected: PropTypes.func,
    onChange: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyPress: PropTypes.func,
    onKeyUp: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    filterOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    displayOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    formInputOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    defaultClassNames: PropTypes.bool,
    customListComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    selectFirst: PropTypes.bool,
    showOptionsWhenEmpty: PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      options: [],
      customClasses: {},
      allowCustomValues: 0,
      initialValue: "",
      value: "",
      placeholder: "",
      disabled: false,
      textarea: false,
      inputProps: {},
      onOptionSelected: function (option) {},
      onChange: function (event) {},
      onKeyDown: function (event) {},
      onKeyPress: function (event) {},
      onKeyUp: function (event) {},
      onFocus: function (event) {},
      onBlur: function (event) {},
      filterOption: null,
      defaultClassNames: true,
      customListComponent: TypeaheadSelector,
      selectFirst: false,
      showOptionsWhenEmpty: false
    };
  },

  getInitialState: function () {
    return {
      // The currently visible set of options
      visible: this.getOptionsForValue(this.props.initialValue, this.props.options),

      // This should be called something else, "entryValue"
      entryValue: this.props.value || this.props.initialValue,

      // A valid typeahead value
      selection: this.props.value,

      // Index of the selection
      selectionIndex: null
    };
  },

  _shouldSkipSearch: function (input) {
    var emptyValue = !input || input.trim().length == 0;
    return !this.props.showOptionsWhenEmpty && emptyValue;
  },

  getOptionsForValue: function (value, options) {
    if (this._shouldSkipSearch(value)) {
      return [];
    }

    var filterOptions = this._generateFilterFunction();
    var result = filterOptions(value, options);
    if (this.props.maxVisible) {
      result = result.slice(0, this.props.maxVisible);
    }
    return result;
  },

  setEntryText: function (value) {
    this.refs.entry.value = value;
    this._onTextEntryUpdated();
  },

  focus: function () {
    this.refs.entry.focus();
  },

  _hasCustomValue: function () {
    if (this.props.allowCustomValues > 0 && this.state.entryValue.length >= this.props.allowCustomValues && this.state.visible.indexOf(this.state.entryValue) < 0) {
      return true;
    }
    return false;
  },

  _getCustomValue: function () {
    if (this._hasCustomValue()) {
      return this.state.entryValue;
    }
    return null;
  },

  _renderIncrementalSearchResults: function () {
    // Nothing has been entered into the textbox
    if (this._shouldSkipSearch(this.state.entryValue)) {
      return "";
    }

    // Something was just selected
    if (this.state.selection) {
      return "";
    }

    return React.createElement(this.props.customListComponent, {
      ref: 'sel', options: this.state.visible,
      onOptionSelected: this._onOptionSelected,
      allowCustomValues: this.props.allowCustomValues,
      customValue: this._getCustomValue(),
      customClasses: this.props.customClasses,
      selectionIndex: this.state.selectionIndex,
      defaultClassNames: this.props.defaultClassNames,
      displayOption: Accessor.generateOptionToStringFor(this.props.displayOption),
      noResultsMessage: this.props.noResultsMessage
    });
  },

  getSelection: function () {
    var index = this.state.selectionIndex;
    if (this._hasCustomValue()) {
      if (index === 0) {
        return this.state.entryValue;
      } else {
        index--;
      }
    }
    return this.state.visible[index];
  },

  _onOptionSelected: function (option, event) {
    var nEntry = this.refs.entry;
    nEntry.focus();

    var displayOption = Accessor.generateOptionToStringFor(this.props.displayOption);
    var optionString = displayOption(option, 0);

    var formInputOption = Accessor.generateOptionToStringFor(this.props.formInputOption || displayOption);
    var formInputOptionString = formInputOption(option);

    nEntry.value = optionString;
    this.setState({ visible: this.getOptionsForValue(optionString, this.props.options),
      selection: formInputOptionString,
      entryValue: optionString });
    return this.props.onOptionSelected(option, event);
  },

  _onTextEntryUpdated: function () {
    var value = this.refs.entry.value;
    this.setState({ visible: this.getOptionsForValue(value, this.props.options),
      selection: '',
      entryValue: value });
  },

  _onEnter: function (event) {
    var selection = this.getSelection();
    if (!selection) {
      return this.props.onKeyDown(event);
    }
    return this._onOptionSelected(selection, event);
  },

  _onEscape: function () {
    this.setState({
      selectionIndex: null
    });
  },

  _onTab: function (event) {
    var selection = this.getSelection();
    var option = selection ? selection : this.state.visible.length > 0 ? this.state.visible[0] : null;

    if (option === null && this._hasCustomValue()) {
      option = this._getCustomValue();
    }

    if (option !== null) {
      return this._onOptionSelected(option, event);
    }
  },

  eventMap: function (event) {
    var events = {};

    events[KeyEvent.DOM_VK_UP] = this.navUp;
    events[KeyEvent.DOM_VK_DOWN] = this.navDown;
    events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  },

  _nav: function (delta) {
    if (!this._hasHint()) {
      return;
    }
    var newIndex = this.state.selectionIndex === null ? delta == 1 ? 0 : delta : this.state.selectionIndex + delta;
    var length = this.state.visible.length;
    if (this._hasCustomValue()) {
      length += 1;
    }

    if (newIndex < 0) {
      newIndex += length;
    } else if (newIndex >= length) {
      newIndex -= length;
    }

    this.setState({ selectionIndex: newIndex });
  },

  navDown: function () {
    this._nav(1);
  },

  navUp: function () {
    this._nav(-1);
  },

  _onChange: function (event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }

    this._onTextEntryUpdated();
  },

  _onKeyDown: function (event) {
    // If there are no visible elements, don't perform selector navigation.
    // Just pass this up to the upstream onKeydown handler.
    // Also skip if the user is pressing the shift key, since none of our handlers are looking for shift
    if (!this._hasHint() || event.shiftKey) {
      return this.props.onKeyDown(event);
    }

    var handler = this.eventMap()[event.keyCode];

    if (handler) {
      handler(event);
    } else {
      return this.props.onKeyDown(event);
    }
    // Don't propagate the keystroke back to the DOM/browser
    event.preventDefault();
  },

  componentWillReceiveProps: function (nextProps) {
    var typeaheadOptionsState = {
      visible: this.getOptionsForValue(this.state.entryValue, nextProps.options)
    };
    if (this.props.selectFirst && nextProps.options.length) {
      typeaheadOptionsState.selectionIndex = 0;
    }

    if (this.props.initialValue != nextProps.initialValue) {
      typeaheadOptionsState.entryValue = nextProps.initialValue;
    }

    this.setState(typeaheadOptionsState);
  },

  render: function () {
    var inputClasses = {};
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
    var inputClassList = classNames(inputClasses);

    var classes = {
      typeahead: this.props.defaultClassNames
    };
    classes[this.props.className] = !!this.props.className;
    var classList = classNames(classes);

    var InputElement = this.props.textarea ? 'textarea' : 'input';
    return React.createElement(
      'div',
      { className: classList },
      this._renderHiddenInput(),
      React.createElement(InputElement, _extends({ ref: 'entry', type: 'text',
        disabled: this.props.disabled
      }, this.props.inputProps, {
        placeholder: this.props.placeholder,
        className: inputClassList,
        value: this.state.entryValue,
        onChange: this._onChange,
        onKeyDown: this._onKeyDown,
        onKeyPress: this.props.onKeyPress,
        onKeyUp: this.props.onKeyUp,
        onFocus: this.props.onFocus,
        onBlur: this.props.onBlur
      })),
      this._renderIncrementalSearchResults()
    );
  },

  _renderHiddenInput: function () {
    if (!this.props.name) {
      return null;
    }

    return React.createElement('input', {
      type: 'hidden',
      name: this.props.name,
      value: this.state.selection
    });
  },

  _generateFilterFunction: function () {
    var filterOptionProp = this.props.filterOption;
    if (typeof filterOptionProp === 'function') {
      return function (value, options) {
        return options.filter(function (o) {
          return filterOptionProp(value, o);
        });
      };
    } else {
      var mapper;
      if (typeof filterOptionProp === 'string') {
        mapper = Accessor.generateAccessor(filterOptionProp);
      } else {
        mapper = Accessor.IDENTITY_FN;
      }
      return function (value, options) {
        return fuzzy.filter(value, options, { extract: mapper }).map(function (res) {
          return options[res.index];
        });
      };
    }
  },

  _hasHint: function () {
    return this.state.visible.length > 0 || this._hasCustomValue();
  }
});

module.exports = Typeahead;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwicmVxdWlyZSIsIlJlYWN0IiwiUHJvcFR5cGVzIiwiY3JlYXRlUmVhY3RDbGFzcyIsIlR5cGVhaGVhZFNlbGVjdG9yIiwiS2V5RXZlbnQiLCJmdXp6eSIsImNsYXNzTmFtZXMiLCJUeXBlYWhlYWQiLCJwcm9wVHlwZXMiLCJuYW1lIiwic3RyaW5nIiwiY3VzdG9tQ2xhc3NlcyIsIm9iamVjdCIsIm1heFZpc2libGUiLCJudW1iZXIiLCJvcHRpb25zIiwiYXJyYXkiLCJhbGxvd0N1c3RvbVZhbHVlcyIsImluaXRpYWxWYWx1ZSIsInZhbHVlIiwicGxhY2Vob2xkZXIiLCJkaXNhYmxlZCIsImJvb2wiLCJ0ZXh0YXJlYSIsImlucHV0UHJvcHMiLCJvbk9wdGlvblNlbGVjdGVkIiwiZnVuYyIsIm9uQ2hhbmdlIiwib25LZXlEb3duIiwib25LZXlQcmVzcyIsIm9uS2V5VXAiLCJvbkZvY3VzIiwib25CbHVyIiwiZmlsdGVyT3B0aW9uIiwib25lT2ZUeXBlIiwiZGlzcGxheU9wdGlvbiIsImZvcm1JbnB1dE9wdGlvbiIsImRlZmF1bHRDbGFzc05hbWVzIiwiY3VzdG9tTGlzdENvbXBvbmVudCIsImVsZW1lbnQiLCJzZWxlY3RGaXJzdCIsInNob3dPcHRpb25zV2hlbkVtcHR5IiwiZ2V0RGVmYXVsdFByb3BzIiwib3B0aW9uIiwiZXZlbnQiLCJnZXRJbml0aWFsU3RhdGUiLCJ2aXNpYmxlIiwiZ2V0T3B0aW9uc0ZvclZhbHVlIiwicHJvcHMiLCJlbnRyeVZhbHVlIiwic2VsZWN0aW9uIiwic2VsZWN0aW9uSW5kZXgiLCJfc2hvdWxkU2tpcFNlYXJjaCIsImlucHV0IiwiZW1wdHlWYWx1ZSIsInRyaW0iLCJsZW5ndGgiLCJmaWx0ZXJPcHRpb25zIiwiX2dlbmVyYXRlRmlsdGVyRnVuY3Rpb24iLCJyZXN1bHQiLCJzbGljZSIsInNldEVudHJ5VGV4dCIsInJlZnMiLCJlbnRyeSIsIl9vblRleHRFbnRyeVVwZGF0ZWQiLCJmb2N1cyIsIl9oYXNDdXN0b21WYWx1ZSIsInN0YXRlIiwiaW5kZXhPZiIsIl9nZXRDdXN0b21WYWx1ZSIsIl9yZW5kZXJJbmNyZW1lbnRhbFNlYXJjaFJlc3VsdHMiLCJfb25PcHRpb25TZWxlY3RlZCIsImdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3IiLCJub1Jlc3VsdHNNZXNzYWdlIiwiZ2V0U2VsZWN0aW9uIiwiaW5kZXgiLCJuRW50cnkiLCJvcHRpb25TdHJpbmciLCJmb3JtSW5wdXRPcHRpb25TdHJpbmciLCJzZXRTdGF0ZSIsIl9vbkVudGVyIiwiX29uRXNjYXBlIiwiX29uVGFiIiwiZXZlbnRNYXAiLCJldmVudHMiLCJET01fVktfVVAiLCJuYXZVcCIsIkRPTV9WS19ET1dOIiwibmF2RG93biIsIkRPTV9WS19SRVRVUk4iLCJET01fVktfRU5URVIiLCJET01fVktfRVNDQVBFIiwiRE9NX1ZLX1RBQiIsIl9uYXYiLCJkZWx0YSIsIl9oYXNIaW50IiwibmV3SW5kZXgiLCJfb25DaGFuZ2UiLCJfb25LZXlEb3duIiwic2hpZnRLZXkiLCJoYW5kbGVyIiwia2V5Q29kZSIsInByZXZlbnREZWZhdWx0IiwiY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5leHRQcm9wcyIsInR5cGVhaGVhZE9wdGlvbnNTdGF0ZSIsInJlbmRlciIsImlucHV0Q2xhc3NlcyIsImlucHV0Q2xhc3NMaXN0IiwiY2xhc3NlcyIsInR5cGVhaGVhZCIsImNsYXNzTmFtZSIsImNsYXNzTGlzdCIsIklucHV0RWxlbWVudCIsIl9yZW5kZXJIaWRkZW5JbnB1dCIsImZpbHRlck9wdGlvblByb3AiLCJmaWx0ZXIiLCJvIiwibWFwcGVyIiwiZ2VuZXJhdGVBY2Nlc3NvciIsIklERU5USVRZX0ZOIiwiZXh0cmFjdCIsIm1hcCIsInJlcyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSUEsV0FBV0MsUUFBUSxhQUFSLENBQWY7QUFDQSxJQUFJQyxRQUFRRCxRQUFRLE9BQVIsQ0FBWjtBQUNB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VUosT0FEVixFQUNtQixFQUFDMEcsU0FBU0gsTUFBVixFQURuQixFQUVKSSxHQUZJLENBRUEsVUFBU0MsR0FBVCxFQUFjO0FBQUUsaUJBQU81RyxRQUFRNEcsSUFBSWhELEtBQVosQ0FBUDtBQUE0QixTQUY1QyxDQUFQO0FBR0QsT0FKRDtBQUtEO0FBQ0YsR0F6VzhCOztBQTJXL0JvQixZQUFVLFlBQVc7QUFDbkIsV0FBTyxLQUFLNUIsS0FBTCxDQUFXckIsT0FBWCxDQUFtQlUsTUFBbkIsR0FBNEIsQ0FBNUIsSUFBaUMsS0FBS1UsZUFBTCxFQUF4QztBQUNEO0FBN1c4QixDQUFqQixDQUFoQjs7QUFnWEEwRCxPQUFPQyxPQUFQLEdBQWlCdEgsU0FBakIiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQWNjZXNzb3IgPSByZXF1aXJlKCcuLi9hY2Nlc3NvcicpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG52YXIgY3JlYXRlUmVhY3RDbGFzcyA9IHJlcXVpcmUoJ2NyZWF0ZS1yZWFjdC1jbGFzcycpO1xudmFyIFR5cGVhaGVhZFNlbGVjdG9yID0gcmVxdWlyZSgnLi9zZWxlY3RvcicpO1xudmFyIEtleUV2ZW50ID0gcmVxdWlyZSgnLi4va2V5ZXZlbnQnKTtcbnZhciBmdXp6eSA9IHJlcXVpcmUoJ2Z1enp5Jyk7XG52YXIgY2xhc3NOYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuLyoqXG4gKiBBIFwidHlwZWFoZWFkXCIsIGFuIGF1dG8tY29tcGxldGluZyB0ZXh0IGlucHV0XG4gKlxuICogUmVuZGVycyBhbiB0ZXh0IGlucHV0IHRoYXQgc2hvd3Mgb3B0aW9ucyBuZWFyYnkgdGhhdCB5b3UgY2FuIHVzZSB0aGVcbiAqIGtleWJvYXJkIG9yIG1vdXNlIHRvIHNlbGVjdC4gIFJlcXVpcmVzIENTUyBmb3IgTUFTU0lWRSBEQU1BR0UuXG4gKi9cbnZhciBUeXBlYWhlYWQgPSBjcmVhdGVSZWFjdENsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgbmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBjdXN0b21DbGFzc2VzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIG1heFZpc2libGU6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgb3B0aW9uczogUHJvcFR5cGVzLmFycmF5LFxuICAgIGFsbG93Q3VzdG9tVmFsdWVzOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIGluaXRpYWxWYWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICB2YWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBwbGFjZWhvbGRlcjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgdGV4dGFyZWE6IFByb3BUeXBlcy5ib29sLFxuICAgIGlucHV0UHJvcHM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgb25PcHRpb25TZWxlY3RlZDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uS2V5RG93bjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25LZXlQcmVzczogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25LZXlVcDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Gb2N1czogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25CbHVyOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBmaWx0ZXJPcHRpb246IFByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIFByb3BUeXBlcy5mdW5jXG4gICAgXSksXG4gICAgZGlzcGxheU9wdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgUHJvcFR5cGVzLmZ1bmNcbiAgICBdKSxcbiAgICBmb3JtSW5wdXRPcHRpb246IFByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIFByb3BUeXBlcy5mdW5jXG4gICAgXSksXG4gICAgZGVmYXVsdENsYXNzTmFtZXM6IFByb3BUeXBlcy5ib29sLFxuICAgIGN1c3RvbUxpc3RDb21wb25lbnQ6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUHJvcFR5cGVzLmVsZW1lbnQsXG4gICAgICBQcm9wVHlwZXMuZnVuY1xuICAgIF0pLFxuICAgIHNlbGVjdEZpcnN0OiBQcm9wVHlwZXMuYm9vbCxcbiAgICBzaG93T3B0aW9uc1doZW5FbXB0eTogUHJvcFR5cGVzLmJvb2xcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBvcHRpb25zOiBbXSxcbiAgICAgIGN1c3RvbUNsYXNzZXM6IHt9LFxuICAgICAgYWxsb3dDdXN0b21WYWx1ZXM6IDAsXG4gICAgICBpbml0aWFsVmFsdWU6IFwiXCIsXG4gICAgICB2YWx1ZTogXCJcIixcbiAgICAgIHBsYWNlaG9sZGVyOiBcIlwiLFxuICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgdGV4dGFyZWE6IGZhbHNlLFxuICAgICAgaW5wdXRQcm9wczoge30sXG4gICAgICBvbk9wdGlvblNlbGVjdGVkOiBmdW5jdGlvbihvcHRpb24pIHt9LFxuICAgICAgb25DaGFuZ2U6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uS2V5RG93bjogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICAgICAgb25LZXlQcmVzczogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICAgICAgb25LZXlVcDogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICAgICAgb25Gb2N1czogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICAgICAgb25CbHVyOiBmdW5jdGlvbihldmVudCkge30sXG4gICAgICBmaWx0ZXJPcHRpb246IG51bGwsXG4gICAgICBkZWZhdWx0Q2xhc3NOYW1lczogdHJ1ZSxcbiAgICAgIGN1c3RvbUxpc3RDb21wb25lbnQ6IFR5cGVhaGVhZFNlbGVjdG9yLFxuICAgICAgc2VsZWN0Rmlyc3Q6IGZhbHNlLFxuICAgICAgc2hvd09wdGlvbnNXaGVuRW1wdHk6IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBUaGUgY3VycmVudGx5IHZpc2libGUgc2V0IG9mIG9wdGlvbnNcbiAgICAgIHZpc2libGU6IHRoaXMuZ2V0T3B0aW9uc0ZvclZhbHVlKHRoaXMucHJvcHMuaW5pdGlhbFZhbHVlLCB0aGlzLnByb3BzLm9wdGlvbnMpLFxuXG4gICAgICAvLyBUaGlzIHNob3VsZCBiZSBjYWxsZWQgc29tZXRoaW5nIGVsc2UsIFwiZW50cnlWYWx1ZVwiXG4gICAgICBlbnRyeVZhbHVlOiB0aGlzLnByb3BzLnZhbHVlIHx8IHRoaXMucHJvcHMuaW5pdGlhbFZhbHVlLFxuXG4gICAgICAvLyBBIHZhbGlkIHR5cGVhaGVhZCB2YWx1ZVxuICAgICAgc2VsZWN0aW9uOiB0aGlzLnByb3BzLnZhbHVlLFxuXG4gICAgICAvLyBJbmRleCBvZiB0aGUgc2VsZWN0aW9uXG4gICAgICBzZWxlY3Rpb25JbmRleDogbnVsbFxuICAgIH07XG4gIH0sXG5cbiAgX3Nob3VsZFNraXBTZWFyY2g6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgdmFyIGVtcHR5VmFsdWUgPSAhaW5wdXQgfHwgaW5wdXQudHJpbSgpLmxlbmd0aCA9PSAwO1xuICAgIHJldHVybiAhdGhpcy5wcm9wcy5zaG93T3B0aW9uc1doZW5FbXB0eSAmJiBlbXB0eVZhbHVlO1xuICB9LFxuXG4gIGdldE9wdGlvbnNGb3JWYWx1ZTogZnVuY3Rpb24odmFsdWUsIG9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy5fc2hvdWxkU2tpcFNlYXJjaCh2YWx1ZSkpIHsgcmV0dXJuIFtdOyB9XG5cbiAgICB2YXIgZmlsdGVyT3B0aW9ucyA9IHRoaXMuX2dlbmVyYXRlRmlsdGVyRnVuY3Rpb24oKTtcbiAgICB2YXIgcmVzdWx0ID0gZmlsdGVyT3B0aW9ucyh2YWx1ZSwgb3B0aW9ucyk7XG4gICAgaWYgKHRoaXMucHJvcHMubWF4VmlzaWJsZSkge1xuICAgICAgcmVzdWx0ID0gcmVzdWx0LnNsaWNlKDAsIHRoaXMucHJvcHMubWF4VmlzaWJsZSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgc2V0RW50cnlUZXh0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHRoaXMucmVmcy5lbnRyeS52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuX29uVGV4dEVudHJ5VXBkYXRlZCgpO1xuICB9LFxuXG4gIGZvY3VzOiBmdW5jdGlvbigpe1xuICAgIHRoaXMucmVmcy5lbnRyeS5mb2N1cygpXG4gIH0sXG5cbiAgX2hhc0N1c3RvbVZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5hbGxvd0N1c3RvbVZhbHVlcyA+IDAgJiZcbiAgICAgIHRoaXMuc3RhdGUuZW50cnlWYWx1ZS5sZW5ndGggPj0gdGhpcy5wcm9wcy5hbGxvd0N1c3RvbVZhbHVlcyAmJlxuICAgICAgdGhpcy5zdGF0ZS52aXNpYmxlLmluZGV4T2YodGhpcy5zdGF0ZS5lbnRyeVZhbHVlKSA8IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgX2dldEN1c3RvbVZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5faGFzQ3VzdG9tVmFsdWUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZW50cnlWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgX3JlbmRlckluY3JlbWVudGFsU2VhcmNoUmVzdWx0czogZnVuY3Rpb24oKSB7XG4gICAgLy8gTm90aGluZyBoYXMgYmVlbiBlbnRlcmVkIGludG8gdGhlIHRleHRib3hcbiAgICBpZiAodGhpcy5fc2hvdWxkU2tpcFNlYXJjaCh0aGlzLnN0YXRlLmVudHJ5VmFsdWUpKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG5cbiAgICAvLyBTb21ldGhpbmcgd2FzIGp1c3Qgc2VsZWN0ZWRcbiAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3Rpb24pIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8dGhpcy5wcm9wcy5jdXN0b21MaXN0Q29tcG9uZW50XG4gICAgICAgIHJlZj1cInNlbFwiIG9wdGlvbnM9e3RoaXMuc3RhdGUudmlzaWJsZX1cbiAgICAgICAgb25PcHRpb25TZWxlY3RlZD17dGhpcy5fb25PcHRpb25TZWxlY3RlZH1cbiAgICAgICAgYWxsb3dDdXN0b21WYWx1ZXM9e3RoaXMucHJvcHMuYWxsb3dDdXN0b21WYWx1ZXN9XG4gICAgICAgIGN1c3RvbVZhbHVlPXt0aGlzLl9nZXRDdXN0b21WYWx1ZSgpfVxuICAgICAgICBjdXN0b21DbGFzc2VzPXt0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXN9XG4gICAgICAgIHNlbGVjdGlvbkluZGV4PXt0aGlzLnN0YXRlLnNlbGVjdGlvbkluZGV4fVxuICAgICAgICBkZWZhdWx0Q2xhc3NOYW1lcz17dGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lc31cbiAgICAgICAgZGlzcGxheU9wdGlvbj17QWNjZXNzb3IuZ2VuZXJhdGVPcHRpb25Ub1N0cmluZ0Zvcih0aGlzLnByb3BzLmRpc3BsYXlPcHRpb24pfVxuICAgICAgICBub1Jlc3VsdHNNZXNzYWdlPXt0aGlzLnByb3BzLm5vUmVzdWx0c01lc3NhZ2V9XG4gICAgICAvPlxuICAgICk7XG4gIH0sXG5cbiAgZ2V0U2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGlvbkluZGV4O1xuICAgIGlmICh0aGlzLl9oYXNDdXN0b21WYWx1ZSgpKSB7XG4gICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZW50cnlWYWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGV4LS07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnN0YXRlLnZpc2libGVbaW5kZXhdO1xuICB9LFxuXG4gIF9vbk9wdGlvblNlbGVjdGVkOiBmdW5jdGlvbihvcHRpb24sIGV2ZW50KSB7XG4gICAgdmFyIG5FbnRyeSA9IHRoaXMucmVmcy5lbnRyeTtcbiAgICBuRW50cnkuZm9jdXMoKTtcblxuICAgIHZhciBkaXNwbGF5T3B0aW9uID0gQWNjZXNzb3IuZ2VuZXJhdGVPcHRpb25Ub1N0cmluZ0Zvcih0aGlzLnByb3BzLmRpc3BsYXlPcHRpb24pO1xuICAgIHZhciBvcHRpb25TdHJpbmcgPSBkaXNwbGF5T3B0aW9uKG9wdGlvbiwgMCk7XG5cbiAgICB2YXIgZm9ybUlucHV0T3B0aW9uID0gQWNjZXNzb3IuZ2VuZXJhdGVPcHRpb25Ub1N0cmluZ0Zvcih0aGlzLnByb3BzLmZvcm1JbnB1dE9wdGlvbiB8fCBkaXNwbGF5T3B0aW9uKTtcbiAgICB2YXIgZm9ybUlucHV0T3B0aW9uU3RyaW5nID0gZm9ybUlucHV0T3B0aW9uKG9wdGlvbik7XG5cbiAgICBuRW50cnkudmFsdWUgPSBvcHRpb25TdHJpbmc7XG4gICAgdGhpcy5zZXRTdGF0ZSh7dmlzaWJsZTogdGhpcy5nZXRPcHRpb25zRm9yVmFsdWUob3B0aW9uU3RyaW5nLCB0aGlzLnByb3BzLm9wdGlvbnMpLFxuICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbjogZm9ybUlucHV0T3B0aW9uU3RyaW5nLFxuICAgICAgICAgICAgICAgICAgIGVudHJ5VmFsdWU6IG9wdGlvblN0cmluZ30pO1xuICAgIHJldHVybiB0aGlzLnByb3BzLm9uT3B0aW9uU2VsZWN0ZWQob3B0aW9uLCBldmVudCk7XG4gIH0sXG5cbiAgX29uVGV4dEVudHJ5VXBkYXRlZDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5yZWZzLmVudHJ5LnZhbHVlO1xuICAgIHRoaXMuc2V0U3RhdGUoe3Zpc2libGU6IHRoaXMuZ2V0T3B0aW9uc0ZvclZhbHVlKHZhbHVlLCB0aGlzLnByb3BzLm9wdGlvbnMpLFxuICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbjogJycsXG4gICAgICAgICAgICAgICAgICAgZW50cnlWYWx1ZTogdmFsdWV9KTtcbiAgfSxcblxuICBfb25FbnRlcjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgc2VsZWN0aW9uID0gdGhpcy5nZXRTZWxlY3Rpb24oKTtcbiAgICBpZiAoIXNlbGVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25LZXlEb3duKGV2ZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX29uT3B0aW9uU2VsZWN0ZWQoc2VsZWN0aW9uLCBldmVudCk7XG4gIH0sXG5cbiAgX29uRXNjYXBlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGlvbkluZGV4OiBudWxsXG4gICAgfSk7XG4gIH0sXG5cbiAgX29uVGFiOiBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBzZWxlY3Rpb24gPSB0aGlzLmdldFNlbGVjdGlvbigpO1xuICAgIHZhciBvcHRpb24gPSBzZWxlY3Rpb24gP1xuICAgICAgc2VsZWN0aW9uIDogKHRoaXMuc3RhdGUudmlzaWJsZS5sZW5ndGggPiAwID8gdGhpcy5zdGF0ZS52aXNpYmxlWzBdIDogbnVsbCk7XG5cbiAgICBpZiAob3B0aW9uID09PSBudWxsICYmIHRoaXMuX2hhc0N1c3RvbVZhbHVlKCkpIHtcbiAgICAgIG9wdGlvbiA9IHRoaXMuX2dldEN1c3RvbVZhbHVlKCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbiAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX29uT3B0aW9uU2VsZWN0ZWQob3B0aW9uLCBldmVudCk7XG4gICAgfVxuICB9LFxuXG4gIGV2ZW50TWFwOiBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBldmVudHMgPSB7fTtcblxuICAgIGV2ZW50c1tLZXlFdmVudC5ET01fVktfVVBdID0gdGhpcy5uYXZVcDtcbiAgICBldmVudHNbS2V5RXZlbnQuRE9NX1ZLX0RPV05dID0gdGhpcy5uYXZEb3duO1xuICAgIGV2ZW50c1tLZXlFdmVudC5ET01fVktfUkVUVVJOXSA9IGV2ZW50c1tLZXlFdmVudC5ET01fVktfRU5URVJdID0gdGhpcy5fb25FbnRlcjtcbiAgICBldmVudHNbS2V5RXZlbnQuRE9NX1ZLX0VTQ0FQRV0gPSB0aGlzLl9vbkVzY2FwZTtcbiAgICBldmVudHNbS2V5RXZlbnQuRE9NX1ZLX1RBQl0gPSB0aGlzLl9vblRhYjtcblxuICAgIHJldHVybiBldmVudHM7XG4gIH0sXG5cbiAgX25hdjogZnVuY3Rpb24oZGVsdGEpIHtcbiAgICBpZiAoIXRoaXMuX2hhc0hpbnQoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgbmV3SW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGlvbkluZGV4ID09PSBudWxsID8gKGRlbHRhID09IDEgPyAwIDogZGVsdGEpIDogdGhpcy5zdGF0ZS5zZWxlY3Rpb25JbmRleCArIGRlbHRhO1xuICAgIHZhciBsZW5ndGggPSB0aGlzLnN0YXRlLnZpc2libGUubGVuZ3RoO1xuICAgIGlmICh0aGlzLl9oYXNDdXN0b21WYWx1ZSgpKSB7XG4gICAgICBsZW5ndGggKz0gMTtcbiAgICB9XG5cbiAgICBpZiAobmV3SW5kZXggPCAwKSB7XG4gICAgICBuZXdJbmRleCArPSBsZW5ndGg7XG4gICAgfSBlbHNlIGlmIChuZXdJbmRleCA+PSBsZW5ndGgpIHtcbiAgICAgIG5ld0luZGV4IC09IGxlbmd0aDtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3Rpb25JbmRleDogbmV3SW5kZXh9KTtcbiAgfSxcblxuICBuYXZEb3duOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9uYXYoMSk7XG4gIH0sXG5cbiAgbmF2VXA6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX25hdigtMSk7XG4gIH0sXG5cbiAgX29uQ2hhbmdlOiBmdW5jdGlvbihldmVudCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKGV2ZW50KTtcbiAgICB9XG5cbiAgICB0aGlzLl9vblRleHRFbnRyeVVwZGF0ZWQoKTtcbiAgfSxcblxuICBfb25LZXlEb3duOiBmdW5jdGlvbihldmVudCkge1xuICAgIC8vIElmIHRoZXJlIGFyZSBubyB2aXNpYmxlIGVsZW1lbnRzLCBkb24ndCBwZXJmb3JtIHNlbGVjdG9yIG5hdmlnYXRpb24uXG4gICAgLy8gSnVzdCBwYXNzIHRoaXMgdXAgdG8gdGhlIHVwc3RyZWFtIG9uS2V5ZG93biBoYW5kbGVyLlxuICAgIC8vIEFsc28gc2tpcCBpZiB0aGUgdXNlciBpcyBwcmVzc2luZyB0aGUgc2hpZnQga2V5LCBzaW5jZSBub25lIG9mIG91ciBoYW5kbGVycyBhcmUgbG9va2luZyBmb3Igc2hpZnRcbiAgICBpZiAoIXRoaXMuX2hhc0hpbnQoKSB8fCBldmVudC5zaGlmdEtleSkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25LZXlEb3duKGV2ZW50KTtcbiAgICB9XG5cbiAgICB2YXIgaGFuZGxlciA9IHRoaXMuZXZlbnRNYXAoKVtldmVudC5rZXlDb2RlXTtcblxuICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICBoYW5kbGVyKGV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25LZXlEb3duKGV2ZW50KTtcbiAgICB9XG4gICAgLy8gRG9uJ3QgcHJvcGFnYXRlIHRoZSBrZXlzdHJva2UgYmFjayB0byB0aGUgRE9NL2Jyb3dzZXJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuICAgIHZhciB0eXBlYWhlYWRPcHRpb25zU3RhdGUgPSB7XG4gICAgICB2aXNpYmxlOiB0aGlzLmdldE9wdGlvbnNGb3JWYWx1ZSh0aGlzLnN0YXRlLmVudHJ5VmFsdWUsIG5leHRQcm9wcy5vcHRpb25zKVxuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RGaXJzdCAmJiBuZXh0UHJvcHMub3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgIHR5cGVhaGVhZE9wdGlvbnNTdGF0ZS5zZWxlY3Rpb25JbmRleCA9IDA7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMuaW5pdGlhbFZhbHVlICE9IG5leHRQcm9wcy5pbml0aWFsVmFsdWUpIHtcbiAgICAgIHR5cGVhaGVhZE9wdGlvbnNTdGF0ZS5lbnRyeVZhbHVlID0gbmV4dFByb3BzLmluaXRpYWxWYWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHR5cGVhaGVhZE9wdGlvbnNTdGF0ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgaW5wdXRDbGFzc2VzID0ge307XG4gICAgaW5wdXRDbGFzc2VzW3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5pbnB1dF0gPSAhIXRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5pbnB1dDtcbiAgICB2YXIgaW5wdXRDbGFzc0xpc3QgPSBjbGFzc05hbWVzKGlucHV0Q2xhc3Nlcyk7XG5cbiAgICB2YXIgY2xhc3NlcyA9IHtcbiAgICAgIHR5cGVhaGVhZDogdGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lc1xuICAgIH07XG4gICAgY2xhc3Nlc1t0aGlzLnByb3BzLmNsYXNzTmFtZV0gPSAhIXRoaXMucHJvcHMuY2xhc3NOYW1lO1xuICAgIHZhciBjbGFzc0xpc3QgPSBjbGFzc05hbWVzKGNsYXNzZXMpO1xuXG4gICAgdmFyIElucHV0RWxlbWVudCA9IHRoaXMucHJvcHMudGV4dGFyZWEgPyAndGV4dGFyZWEnIDogJ2lucHV0JztcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzTGlzdH0+XG4gICAgICAgIHsgdGhpcy5fcmVuZGVySGlkZGVuSW5wdXQoKSB9XG4gICAgICAgIDxJbnB1dEVsZW1lbnQgcmVmPVwiZW50cnlcIiB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9XG4gICAgICAgICAgey4uLnRoaXMucHJvcHMuaW5wdXRQcm9wc31cbiAgICAgICAgICBwbGFjZWhvbGRlcj17dGhpcy5wcm9wcy5wbGFjZWhvbGRlcn1cbiAgICAgICAgICBjbGFzc05hbWU9e2lucHV0Q2xhc3NMaXN0fVxuICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmVudHJ5VmFsdWV9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlfVxuICAgICAgICAgIG9uS2V5RG93bj17dGhpcy5fb25LZXlEb3dufVxuICAgICAgICAgIG9uS2V5UHJlc3M9e3RoaXMucHJvcHMub25LZXlQcmVzc31cbiAgICAgICAgICBvbktleVVwPXt0aGlzLnByb3BzLm9uS2V5VXB9XG4gICAgICAgICAgb25Gb2N1cz17dGhpcy5wcm9wcy5vbkZvY3VzfVxuICAgICAgICAgIG9uQmx1cj17dGhpcy5wcm9wcy5vbkJsdXJ9XG4gICAgICAgIC8+XG4gICAgICAgIHsgdGhpcy5fcmVuZGVySW5jcmVtZW50YWxTZWFyY2hSZXN1bHRzKCkgfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcblxuICBfcmVuZGVySGlkZGVuSW5wdXQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5wcm9wcy5uYW1lKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGlucHV0XG4gICAgICAgIHR5cGU9XCJoaWRkZW5cIlxuICAgICAgICBuYW1lPXsgdGhpcy5wcm9wcy5uYW1lIH1cbiAgICAgICAgdmFsdWU9eyB0aGlzLnN0YXRlLnNlbGVjdGlvbiB9XG4gICAgICAvPlxuICAgICk7XG4gIH0sXG5cbiAgX2dlbmVyYXRlRmlsdGVyRnVuY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmaWx0ZXJPcHRpb25Qcm9wID0gdGhpcy5wcm9wcy5maWx0ZXJPcHRpb247XG4gICAgaWYgKHR5cGVvZiBmaWx0ZXJPcHRpb25Qcm9wID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbnMuZmlsdGVyKGZ1bmN0aW9uKG8pIHsgcmV0dXJuIGZpbHRlck9wdGlvblByb3AodmFsdWUsIG8pOyB9KTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBtYXBwZXI7XG4gICAgICBpZiAodHlwZW9mIGZpbHRlck9wdGlvblByb3AgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIG1hcHBlciA9IEFjY2Vzc29yLmdlbmVyYXRlQWNjZXNzb3IoZmlsdGVyT3B0aW9uUHJvcCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXBwZXIgPSBBY2Nlc3Nvci5JREVOVElUWV9GTjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZnV6enlcbiAgICAgICAgICAuZmlsdGVyKHZhbHVlLCBvcHRpb25zLCB7ZXh0cmFjdDogbWFwcGVyfSlcbiAgICAgICAgICAubWFwKGZ1bmN0aW9uKHJlcykgeyByZXR1cm4gb3B0aW9uc1tyZXMuaW5kZXhdOyB9KTtcbiAgICAgIH07XG4gICAgfVxuICB9LFxuXG4gIF9oYXNIaW50OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS52aXNpYmxlLmxlbmd0aCA+IDAgfHwgdGhpcy5faGFzQ3VzdG9tVmFsdWUoKTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHlwZWFoZWFkO1xuIl19
},{"../accessor":15,"../keyevent":16,"./selector":22,"classnames":1,"create-react-class":3,"fuzzy":8,"prop-types":13,"react":"react"}],21:[function(require,module,exports){
var React = window.React || require('react');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
var classNames = require('classnames');

/**
 * A single option within the TypeaheadSelector
 */
var TypeaheadOption = createReactClass({
  displayName: 'TypeaheadOption',

  propTypes: {
    customClasses: PropTypes.object,
    customValue: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.string,
    hover: PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      customClasses: {},
      onClick: function (event) {
        event.preventDefault();
      }
    };
  },

  render: function () {
    var classes = {};
    classes[this.props.customClasses.hover || "hover"] = !!this.props.hover;
    classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;

    if (this.props.customValue) {
      classes[this.props.customClasses.customAdd] = !!this.props.customClasses.customAdd;
    }

    var classList = classNames(classes);

    return React.createElement(
      'li',
      { className: classList, onClick: this._onClick },
      React.createElement(
        'a',
        { href: 'javascript: void 0;', className: this._getClasses(), ref: 'anchor' },
        this.props.children
      )
    );
  },

  _getClasses: function () {
    var classes = {
      "typeahead-option": true
    };
    classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;

    return classNames(classes);
  },

  _onClick: function (event) {
    event.preventDefault();
    return this.props.onClick(event);
  }
});

module.exports = TypeaheadOption;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9wdGlvbi5qcyJdLCJuYW1lcyI6WyJSZWFjdCIsInJlcXVpcmUiLCJQcm9wVHlwZXMiLCJjcmVhdGVSZWFjdENsYXNzIiwiY2xhc3NOYW1lcyIsIlR5cGVhaGVhZE9wdGlvbiIsInByb3BUeXBlcyIsImN1c3RvbUNsYXNzZXMiLCJvYmplY3QiLCJjdXN0b21WYWx1ZSIsInN0cmluZyIsIm9uQ2xpY2siLCJmdW5jIiwiY2hpbGRyZW4iLCJob3ZlciIsImJvb2wiLCJnZXREZWZhdWx0UHJvcHMiLCJldmVudCIsInByZXZlbnREZWZhdWx0IiwicmVuZGVyIiwiY2xhc3NlcyIsInByb3BzIiwibGlzdEl0ZW0iLCJjdXN0b21BZGQiLCJjbGFzc0xpc3QiLCJfb25DbGljayIsIl9nZXRDbGFzc2VzIiwibGlzdEFuY2hvciIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLElBQUlBLFFBQVFDLFFBQVEsT0FBUixDQUFaO0FBQ0EsSUFBSUMsWUFBWUQsUUFBUSxZQUFSLENBQWhCO0FBQ0EsSUFBSUUsbUJBQW1CRixRQUFRLG9CQUFSLENBQXZCO0FBQ0EsSUFBSUcsYUFBYUgsUUFBUSxZQUFSLENBQWpCOztBQUVBOzs7QUFHQSxJQUFJSSxrQkFBa0JGLGlCQUFpQjtBQUFBOztBQUNyQ0csYUFBVztBQUNUQyxtQkFBZUwsVUFBVU0sTUFEaEI7QUFFVEMsaUJBQWFQLFVBQVVRLE1BRmQ7QUFHVEMsYUFBU1QsVUFBVVUsSUFIVjtBQUlUQyxjQUFVWCxVQUFVUSxNQUpYO0FBS1RJLFdBQU9aLFVBQVVhO0FBTFIsR0FEMEI7O0FBU3JDQyxtQkFBaUIsWUFBVztBQUMxQixXQUFPO0FBQ0xULHFCQUFlLEVBRFY7QUFFTEksZUFBUyxVQUFTTSxLQUFULEVBQWdCO0FBQ3ZCQSxjQUFNQyxjQUFOO0FBQ0Q7QUFKSSxLQUFQO0FBTUQsR0FoQm9DOztBQWtCckNDLFVBQVEsWUFBVztBQUNqQixRQUFJQyxVQUFVLEVBQWQ7QUFDQUEsWUFBUSxLQUFLQyxLQUFMLENBQVdkLGFBQVgsQ0FBeUJPLEtBQXpCLElBQWtDLE9BQTFDLElBQXFELENBQUMsQ0FBQyxLQUFLTyxLQUFMLENBQVdQLEtBQWxFO0FBQ0FNLFlBQVEsS0FBS0MsS0FBTCxDQUFXZCxhQUFYLENBQXlCZSxRQUFqQyxJQUE2QyxDQUFDLENBQUMsS0FBS0QsS0FBTCxDQUFXZCxhQUFYLENBQXlCZSxRQUF4RTs7QUFFQSxRQUFJLEtBQUtELEtBQUwsQ0FBV1osV0FBZixFQUE0QjtBQUMxQlcsY0FBUSxLQUFLQyxLQUFMLENBQVdkLGFBQVgsQ0FBeUJnQixTQUFqQyxJQUE4QyxDQUFDLENBQUMsS0FBS0YsS0FBTCxDQUFXZCxhQUFYLENBQXlCZ0IsU0FBekU7QUFDRDs7QUFFRCxRQUFJQyxZQUFZcEIsV0FBV2dCLE9BQVgsQ0FBaEI7O0FBRUEsV0FDRTtBQUFBO0FBQUEsUUFBSSxXQUFXSSxTQUFmLEVBQTBCLFNBQVMsS0FBS0MsUUFBeEM7QUFDRTtBQUFBO0FBQUEsVUFBRyxNQUFLLHFCQUFSLEVBQThCLFdBQVcsS0FBS0MsV0FBTCxFQUF6QyxFQUE2RCxLQUFJLFFBQWpFO0FBQ0ksYUFBS0wsS0FBTCxDQUFXUjtBQURmO0FBREYsS0FERjtBQU9ELEdBcENvQzs7QUFzQ3JDYSxlQUFhLFlBQVc7QUFDdEIsUUFBSU4sVUFBVTtBQUNaLDBCQUFvQjtBQURSLEtBQWQ7QUFHQUEsWUFBUSxLQUFLQyxLQUFMLENBQVdkLGFBQVgsQ0FBeUJvQixVQUFqQyxJQUErQyxDQUFDLENBQUMsS0FBS04sS0FBTCxDQUFXZCxhQUFYLENBQXlCb0IsVUFBMUU7O0FBRUEsV0FBT3ZCLFdBQVdnQixPQUFYLENBQVA7QUFDRCxHQTdDb0M7O0FBK0NyQ0ssWUFBVSxVQUFTUixLQUFULEVBQWdCO0FBQ3hCQSxVQUFNQyxjQUFOO0FBQ0EsV0FBTyxLQUFLRyxLQUFMLENBQVdWLE9BQVgsQ0FBbUJNLEtBQW5CLENBQVA7QUFDRDtBQWxEb0MsQ0FBakIsQ0FBdEI7O0FBc0RBVyxPQUFPQyxPQUFQLEdBQWlCeEIsZUFBakIiLCJmaWxlIjoib3B0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG52YXIgY3JlYXRlUmVhY3RDbGFzcyA9IHJlcXVpcmUoJ2NyZWF0ZS1yZWFjdC1jbGFzcycpO1xudmFyIGNsYXNzTmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5cbi8qKlxuICogQSBzaW5nbGUgb3B0aW9uIHdpdGhpbiB0aGUgVHlwZWFoZWFkU2VsZWN0b3JcbiAqL1xudmFyIFR5cGVhaGVhZE9wdGlvbiA9IGNyZWF0ZVJlYWN0Q2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBjdXN0b21DbGFzc2VzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIGN1c3RvbVZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIGNoaWxkcmVuOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGhvdmVyOiBQcm9wVHlwZXMuYm9vbFxuICB9LFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGN1c3RvbUNsYXNzZXM6IHt9LFxuICAgICAgb25DbGljazogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNsYXNzZXMgPSB7fTtcbiAgICBjbGFzc2VzW3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5ob3ZlciB8fCBcImhvdmVyXCJdID0gISF0aGlzLnByb3BzLmhvdmVyO1xuICAgIGNsYXNzZXNbdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLmxpc3RJdGVtXSA9ICEhdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLmxpc3RJdGVtO1xuXG4gICAgaWYgKHRoaXMucHJvcHMuY3VzdG9tVmFsdWUpIHtcbiAgICAgIGNsYXNzZXNbdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLmN1c3RvbUFkZF0gPSAhIXRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5jdXN0b21BZGQ7XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzTGlzdCA9IGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGxpIGNsYXNzTmFtZT17Y2xhc3NMaXN0fSBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrfT5cbiAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6IHZvaWQgMDtcIiBjbGFzc05hbWU9e3RoaXMuX2dldENsYXNzZXMoKX0gcmVmPVwiYW5jaG9yXCI+XG4gICAgICAgICAgeyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cbiAgICAgICAgPC9hPlxuICAgICAgPC9saT5cbiAgICApO1xuICB9LFxuXG4gIF9nZXRDbGFzc2VzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xhc3NlcyA9IHtcbiAgICAgIFwidHlwZWFoZWFkLW9wdGlvblwiOiB0cnVlLFxuICAgIH07XG4gICAgY2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMubGlzdEFuY2hvcl0gPSAhIXRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5saXN0QW5jaG9yO1xuXG4gICAgcmV0dXJuIGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG4gIH0sXG5cbiAgX29uQ2xpY2s6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkNsaWNrKGV2ZW50KTtcbiAgfVxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlYWhlYWRPcHRpb247XG4iXX0=
},{"classnames":1,"create-react-class":3,"prop-types":13,"react":"react"}],22:[function(require,module,exports){
var React = window.React || require('react');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
var TypeaheadOption = require('./option');
var classNames = require('classnames');

/**
 * Container for the options rendered as part of the autocompletion process
 * of the typeahead
 */
var TypeaheadSelector = createReactClass({
  displayName: 'TypeaheadSelector',

  propTypes: {
    options: PropTypes.array,
    allowCustomValues: PropTypes.number,
    customClasses: PropTypes.object,
    customValue: PropTypes.string,
    selectionIndex: PropTypes.number,
    onOptionSelected: PropTypes.func,
    displayOption: PropTypes.func.isRequired,
    defaultClassNames: PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      selectionIndex: null,
      customClasses: {},
      allowCustomValues: 0,
      customValue: null,
      onOptionSelected: function (option) {},
      defaultClassNames: true,
      noResultsMessage: null
    };
  },

  render: function () {
    if (!this.props.options.length) {
      if (this.props.noResultsMessage) {
        return React.createElement(
          'div',
          { className: 'typeahead-no-matches' },
          this.props.noResultsMessage
        );
      } else if (this.props.allowCustomValues <= 0) {
        return false;
      }
    }

    var classes = {
      "typeahead-selector": this.props.defaultClassNames
    };
    classes[this.props.customClasses.results] = this.props.customClasses.results;
    var classList = classNames(classes);

    // CustomValue should be added to top of results list with different class name
    var customValue = null;
    var customValueOffset = 0;
    if (this.props.customValue !== null) {
      customValueOffset++;
      customValue = React.createElement(
        TypeaheadOption,
        { ref: this.props.customValue, key: this.props.customValue,
          hover: this.props.selectionIndex === 0,
          customClasses: this.props.customClasses,
          customValue: this.props.customValue,
          onClick: this._onClick.bind(this, this.props.customValue) },
        this.props.customValue
      );
    }

    var results = this.props.options.map(function (result, i) {
      var displayString = this.props.displayOption(result, i);
      var uniqueKey = displayString + '_' + i;
      return React.createElement(
        TypeaheadOption,
        { ref: uniqueKey, key: uniqueKey,
          hover: this.props.selectionIndex === i + customValueOffset,
          customClasses: this.props.customClasses,
          onClick: this._onClick.bind(this, result) },
        displayString
      );
    }, this);

    return React.createElement(
      'ul',
      { className: classList },
      customValue,
      results
    );
  },

  _onClick: function (result, event) {
    return this.props.onOptionSelected(result, event);
  }

});

module.exports = TypeaheadSelector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbIlJlYWN0IiwicmVxdWlyZSIsIlByb3BUeXBlcyIsImNyZWF0ZVJlYWN0Q2xhc3MiLCJUeXBlYWhlYWRPcHRpb24iLCJjbGFzc05hbWVzIiwiVHlwZWFoZWFkU2VsZWN0b3IiLCJwcm9wVHlwZXMiLCJvcHRpb25zIiwiYXJyYXkiLCJhbGxvd0N1c3RvbVZhbHVlcyIsIm51bWJlciIsImN1c3RvbUNsYXNzZXMiLCJvYmplY3QiLCJjdXN0b21WYWx1ZSIsInN0cmluZyIsInNlbGVjdGlvbkluZGV4Iiwib25PcHRpb25TZWxlY3RlZCIsImZ1bmMiLCJkaXNwbGF5T3B0aW9uIiwiaXNSZXF1aXJlZCIsImRlZmF1bHRDbGFzc05hbWVzIiwiYm9vbCIsImdldERlZmF1bHRQcm9wcyIsIm9wdGlvbiIsIm5vUmVzdWx0c01lc3NhZ2UiLCJyZW5kZXIiLCJwcm9wcyIsImxlbmd0aCIsImNsYXNzZXMiLCJyZXN1bHRzIiwiY2xhc3NMaXN0IiwiY3VzdG9tVmFsdWVPZmZzZXQiLCJfb25DbGljayIsImJpbmQiLCJtYXAiLCJyZXN1bHQiLCJpIiwiZGlzcGxheVN0cmluZyIsInVuaXF1ZUtleSIsImV2ZW50IiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSUEsUUFBUUMsUUFBUSxPQUFSLENBQVo7QUFDQSxJQUFJQyxZQUFZRCxRQUFRLFlBQVIsQ0FBaEI7QUFDQSxJQUFJRSxtQkFBbUJGLFFBQVEsb0JBQVIsQ0FBdkI7QUFDQSxJQUFJRyxrQkFBa0JILFFBQVEsVUFBUixDQUF0QjtBQUNBLElBQUlJLGFBQWFKLFFBQVEsWUFBUixDQUFqQjs7QUFFQTs7OztBQUlBLElBQUlLLG9CQUFvQkgsaUJBQWlCO0FBQUE7O0FBQ3ZDSSxhQUFXO0FBQ1RDLGFBQVNOLFVBQVVPLEtBRFY7QUFFVEMsdUJBQW1CUixVQUFVUyxNQUZwQjtBQUdUQyxtQkFBZVYsVUFBVVcsTUFIaEI7QUFJVEMsaUJBQWFaLFVBQVVhLE1B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LEVBQXdCO0FBQ2hDLFdBQU8sS0FBS2IsS0FBTCxDQUFXVixnQkFBWCxDQUE0Qm1CLE1BQTVCLEVBQW9DSSxLQUFwQyxDQUFQO0FBQ0Q7O0FBOUVzQyxDQUFqQixDQUF4Qjs7QUFrRkFDLE9BQU9DLE9BQVAsR0FBaUJwQyxpQkFBakIiLCJmaWxlIjoic2VsZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcbnZhciBjcmVhdGVSZWFjdENsYXNzID0gcmVxdWlyZSgnY3JlYXRlLXJlYWN0LWNsYXNzJyk7XG52YXIgVHlwZWFoZWFkT3B0aW9uID0gcmVxdWlyZSgnLi9vcHRpb24nKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG4vKipcbiAqIENvbnRhaW5lciBmb3IgdGhlIG9wdGlvbnMgcmVuZGVyZWQgYXMgcGFydCBvZiB0aGUgYXV0b2NvbXBsZXRpb24gcHJvY2Vzc1xuICogb2YgdGhlIHR5cGVhaGVhZFxuICovXG52YXIgVHlwZWFoZWFkU2VsZWN0b3IgPSBjcmVhdGVSZWFjdENsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgb3B0aW9uczogUHJvcFR5cGVzLmFycmF5LFxuICAgIGFsbG93Q3VzdG9tVmFsdWVzOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIGN1c3RvbUNsYXNzZXM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgY3VzdG9tVmFsdWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgc2VsZWN0aW9uSW5kZXg6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgb25PcHRpb25TZWxlY3RlZDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgZGlzcGxheU9wdGlvbjogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBkZWZhdWx0Q2xhc3NOYW1lczogUHJvcFR5cGVzLmJvb2xcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzZWxlY3Rpb25JbmRleDogbnVsbCxcbiAgICAgIGN1c3RvbUNsYXNzZXM6IHt9LFxuICAgICAgYWxsb3dDdXN0b21WYWx1ZXM6IDAsXG4gICAgICBjdXN0b21WYWx1ZTogbnVsbCxcbiAgICAgIG9uT3B0aW9uU2VsZWN0ZWQ6IGZ1bmN0aW9uKG9wdGlvbikgeyB9LFxuICAgICAgZGVmYXVsdENsYXNzTmFtZXM6IHRydWUsXG4gICAgICBub1Jlc3VsdHNNZXNzYWdlOiBudWxsXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5wcm9wcy5vcHRpb25zLmxlbmd0aCkge1xuICAgICAgaWYgKHRoaXMucHJvcHMubm9SZXN1bHRzTWVzc2FnZSkge1xuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJ0eXBlYWhlYWQtbm8tbWF0Y2hlc1wiPnsgdGhpcy5wcm9wcy5ub1Jlc3VsdHNNZXNzYWdlIH08L2Rpdj47XG4gICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuYWxsb3dDdXN0b21WYWx1ZXMgPD0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzZXMgPSB7XG4gICAgICBcInR5cGVhaGVhZC1zZWxlY3RvclwiOiB0aGlzLnByb3BzLmRlZmF1bHRDbGFzc05hbWVzXG4gICAgfTtcbiAgICBjbGFzc2VzW3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5yZXN1bHRzXSA9IHRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5yZXN1bHRzO1xuICAgIHZhciBjbGFzc0xpc3QgPSBjbGFzc05hbWVzKGNsYXNzZXMpO1xuXG4gICAgLy8gQ3VzdG9tVmFsdWUgc2hvdWxkIGJlIGFkZGVkIHRvIHRvcCBvZiByZXN1bHRzIGxpc3Qgd2l0aCBkaWZmZXJlbnQgY2xhc3MgbmFtZVxuICAgIHZhciBjdXN0b21WYWx1ZSA9IG51bGw7XG4gICAgdmFyIGN1c3RvbVZhbHVlT2Zmc2V0ID0gMDtcbiAgICBpZiAodGhpcy5wcm9wcy5jdXN0b21WYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgY3VzdG9tVmFsdWVPZmZzZXQrKztcbiAgICAgIGN1c3RvbVZhbHVlID0gKFxuICAgICAgICA8VHlwZWFoZWFkT3B0aW9uIHJlZj17dGhpcy5wcm9wcy5jdXN0b21WYWx1ZX0ga2V5PXt0aGlzLnByb3BzLmN1c3RvbVZhbHVlfVxuICAgICAgICAgIGhvdmVyPXt0aGlzLnByb3BzLnNlbGVjdGlvbkluZGV4ID09PSAwfVxuICAgICAgICAgIGN1c3RvbUNsYXNzZXM9e3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlc31cbiAgICAgICAgICBjdXN0b21WYWx1ZT17dGhpcy5wcm9wcy5jdXN0b21WYWx1ZX1cbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrLmJpbmQodGhpcywgdGhpcy5wcm9wcy5jdXN0b21WYWx1ZSl9PlxuICAgICAgICAgIHsgdGhpcy5wcm9wcy5jdXN0b21WYWx1ZSB9XG4gICAgICAgIDwvVHlwZWFoZWFkT3B0aW9uPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0cyA9IHRoaXMucHJvcHMub3B0aW9ucy5tYXAoZnVuY3Rpb24ocmVzdWx0LCBpKSB7XG4gICAgICB2YXIgZGlzcGxheVN0cmluZyA9IHRoaXMucHJvcHMuZGlzcGxheU9wdGlvbihyZXN1bHQsIGkpO1xuICAgICAgdmFyIHVuaXF1ZUtleSA9IGRpc3BsYXlTdHJpbmcgKyAnXycgKyBpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFR5cGVhaGVhZE9wdGlvbiByZWY9e3VuaXF1ZUtleX0ga2V5PXt1bmlxdWVLZXl9XG4gICAgICAgICAgaG92ZXI9e3RoaXMucHJvcHMuc2VsZWN0aW9uSW5kZXggPT09IGkgKyBjdXN0b21WYWx1ZU9mZnNldH1cbiAgICAgICAgICBjdXN0b21DbGFzc2VzPXt0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXN9XG4gICAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGljay5iaW5kKHRoaXMsIHJlc3VsdCl9PlxuICAgICAgICAgIHsgZGlzcGxheVN0cmluZyB9XG4gICAgICAgIDwvVHlwZWFoZWFkT3B0aW9uPlxuICAgICAgKTtcbiAgICB9LCB0aGlzKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8dWwgY2xhc3NOYW1lPXtjbGFzc0xpc3R9PlxuICAgICAgICB7IGN1c3RvbVZhbHVlIH1cbiAgICAgICAgeyByZXN1bHRzIH1cbiAgICAgIDwvdWw+XG4gICAgKTtcbiAgfSxcblxuICBfb25DbGljazogZnVuY3Rpb24ocmVzdWx0LCBldmVudCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLm9uT3B0aW9uU2VsZWN0ZWQocmVzdWx0LCBldmVudCk7XG4gIH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHlwZWFoZWFkU2VsZWN0b3I7XG4iXX0=
},{"./option":21,"classnames":1,"create-react-class":3,"prop-types":13,"react":"react"}]},{},[17])(17)
});