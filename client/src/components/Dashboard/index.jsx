import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DashboardOrderHistory from './DashboardOrderHistory';
import Footer from '../util/Footer';
import FilterOrders from './FilterOrders';
import TotalOrders from './TotalOrders';
import TotalSales from './TotalAmount';
import errorHandler from '../util/errorHandler';


const ConnectedDashboard = ({ fetchAllOrdersError }) => {
  const DashboardOrderHistoryWithErrorHandling =
    errorHandler(DashboardOrderHistory, 'Error fetching orders');

  return (
    <div>
      <main
        className="dash-main text-center bg-dark-light"
        style={{ minHeight: 'calc(100vh - 151px)' }}
      >
        <h1>Dashboard</h1>
        <section className="card dashboard">
          <TotalOrders />
          <TotalSales />
          <FilterOrders />
          <DashboardOrderHistoryWithErrorHandling
            error={fetchAllOrdersError}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
};

ConnectedDashboard.propTypes = {
  /* eslint react/require-default-props: 0 */
  fetchAllOrdersError: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.objectOf(PropTypes.string),
  ]),
};

const mapStateToProps = state => ({
  fetchAllOrdersError: state.dashboard.fetchAllOrdersError,
});

const Dashboard = connect(mapStateToProps)(ConnectedDashboard);

export default Dashboard;
