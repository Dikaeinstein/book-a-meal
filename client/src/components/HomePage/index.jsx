import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import IntroBanner from './IntroBanner';
import MenuCard from '../MenuCard';
import errorHandler from '../util/errorHandler';
import Footer from '../util/Footer';

const ConnectedHomePage = ({ error }) => {
  const MenuCardWithErrorHandling =
    errorHandler(MenuCard, 'Error fetching menu');

  return (
    <div>
      <IntroBanner />
      <MenuCardWithErrorHandling
        link="/signIn"
        error={error}
      />
      <Footer />
    </div>
  );
};

ConnectedHomePage.propTypes = {
  /* eslint react/require-default-props: 0 */
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.objectOf(PropTypes.string),
  ]),
};

const mapStateToProps = state => ({
  error: state.menu.error,
});

const HomePage = connect(mapStateToProps)(ConnectedHomePage);
export default HomePage;