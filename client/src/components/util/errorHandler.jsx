import React from 'react';
import PropTypes from 'prop-types';
import transformError from '../../helpers/transformError';

const errorHandler = (WrappedComponent, defaultMessage) => {
  const ErrorWrapper = ({ error, ...rest }) => {
    if (error) {
      return (
        <h1 className="error-container text-center">
          {transformError(error, defaultMessage)}
        </h1>
      );
    }

    return <WrappedComponent {...rest} />;
  };

  ErrorWrapper.propTypes = {
    /* eslint react/require-default-props: 0 */
    error: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.objectOf(PropTypes.string),
    ]),
  };

  return ErrorWrapper;
};

export default errorHandler;