import dotenv from 'dotenv';
import format from 'date-fns/format';
import differenceInHour from 'date-fns/difference_in_hours';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';
import { Op } from 'sequelize';
import { Order, User, Meal } from '../models';

dotenv.config();

/**
 * @class OrderController
 *
 * @export
 */
class OrderController {
  /**
  * @description - Get all orders
  * @static
  * @async
  *
  * @param {object} req - HTTP Request
  * @param {object} res - HTTP Response
  *
  * @memberof - OrderController
  *
  * @returns {Promise<object>}
  */
  static async getAllOrders(req, res) {
    const error = {};
    const orders = await Order.findAll();
    if (orders.length === 0) {
      error.message = 'No order have been placed';
      return res.status(404).json({
        status: 'error',
        message: error.message,
        error,
      });
    }

    const filteredOrders = orders.map(order => (
      {
        id: order.id,
        quantity: order.quantity,
        total: order.total,
        status: order.status,
        expired: order.expired,
        userId: order.userId,
        mealId: order.mealId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }
    ));

    return res.status(200).json({
      message: 'Orders succesfully retrieved',
      status: 'success',
      orders: filteredOrders,
    });
  }

  /**
   * @description - Get all orders for specific date
   * @static
   * @async
   *
   * @param {object} req - HTTP Request
   * @param {object} res - HTTP Response
   *
   * @memberof OrderController
   *
   * @returns {Promis<object>}
   */
  static async getAllOrdersForSpecificDate(req, res) {
    const { date } = req.params;
    const error = {};
    // Filter orders by date
    const matchedOrders = await Order.findAll({
      where: { created_at: date },
    });

    if (matchedOrders.length === 0) {
      error.order = 'No order have been placed';
      return res.status(404).json({
        status: 'success',
        message: error.order,
        orders: matchedOrders,
      });
    }

    return res.status(200).json({
      message: 'Orders succesfully retrieved',
      status: 'success',
      orders: matchedOrders,
    });
  }

  /**
   * @description - Get order history for specific user
   * @static
   * @async
   *
   * @param {object} req - HTTP Request
   * @param {object} res - HTTP Response
   *
   * @memberof OrderController
   *
   * @returns {Promise<object>}
   */
  static async getUserOrderHistory(req, res) {
    const userId = req.params.userId || req.userId;
    const error = {};
    // Filter by orders userId
    const matchedOrders = await Order.findAll({
      where: { id: userId },
    });

    if (matchedOrders.length === 0) {
      error.order = 'User have no placed an order';
      return res.status(404).json({
        status: 'error',
        message: error.order,
        error,
      });
    }

    return res.status(200).json({
      message: 'Orders succesfully retrieved',
      status: 'success',
      orders: matchedOrders,
    });
  }

  /**
   * @description - Get Total amount made
   * @static
   * @async
   *
   * @param {object} req HTTP Request
   * @param {object} res HTTP Response
   *
   * @memberof OrderController
   *
   * @returns {Promise<object>}
   */
  static async getTotalAmount(req, res) {
    const { date } = req.params;
    let total;
    let matchedOrders;
    if (date) {
      // Filter orders by date
      matchedOrders = await Order.findAll({
        where: {
          created_at: {
            [Op.gte]: format(date),
          },
        },
      });
    } else {
      // Use current date as default
      const currentDate = new Date();
      currentDate.setUTCHours(0, 0, 0, 0);

      matchedOrders = await Order.findAll({
        where: {
          created_at: {
            [Op.gte]: format(currentDate.toISOString()),
          },
        },
      });
      if (matchedOrders.length > 0) {
        total = matchedOrders
          .map(matchedOrder => (
            parseInt(matchedOrder.total, 10)
          ))
          .reduce((start, current) => (
            start + current
          ));
      } else {
        total = 0;
      }
    }

    return res.status(200).json({
      message: 'Orders total amount successfully retrieved',
      status: 'success',
      total,
    });
  }

  /**
   * @description - Make an order
   * @static
   * @async
   *
   * @param {object} req - HTTP Request
   * @param {object} res - HTTP Response
   *
   * @memberof OrderController
   *
   * @returns {Promise<object>}
   */
  static async makeAnOrder(req, res) {
    const {
      mealId,
      amount,
      quantity,
      total,
    } = req.body;
    const { userId } = req;
    const error = {};
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);

    const order = {
      meal_id: mealId,
      amount,
      quantity,
      total,
      user_id: userId,
    };

    const user = await User.findById(userId);
    const meal = await Meal.findById(mealId);
    if (!user) {
      error.user = 'User does not exist';
      return res.status(404).json({
        message: error.user,
        status: 'error',
        error,
      });
    }
    if (!meal) {
      error.meal = 'Meal does not exist';
      return res.status(404).json({
        message: error.meal,
        status: 'error',
        error,
      });
    }
    const newOrder = await Order.create(order);
    return res.status(201).json({
      message: 'Order placed',
      status: 'success',
      order: {
        mealName: meal.name,
        customerName: user.name,
        quantity: newOrder.quantity,
        total: newOrder.total,
        status: newOrder.status,
        expired: newOrder.expired,
        createdAt: newOrder.createdAt,
        updatedAt: newOrder.updatedAt,
      },
    });
  }

  /**
   * @description - Update an order
   * @static
   * @async
   *
   * @param {object} req - HTTP Request
   * @param {object} res - HTTP Response
   *
   * @memberof OrderController
   *
   * @returns {Promise<object>}
   */
  static async updateOrder(req, res) {
    const error = {};

    // Filter orders
    const matchedOrder = await Order.findOne({
      where: { id: req.params.orderId },
    });

    if (!matchedOrder) {
      error.id = 'Order id does not exist';
      return res.status(404).json({
        message: error.id,
        status: 'error',
        error,
      });
    }

    if (matchedOrder && !matchedOrder.expired) {
      if (process.env.NODE_ENV === 'test') {
        if (differenceInMilliseconds(Date.now(), matchedOrder.createdAt) >= 2000) {
          const updatedOrder = matchedOrder.update({ expired: true });
          error.message = 'You can no longer update this order';
          return res.status(405).json({
            message: error.message,
            status: 'error',
            error,
            order: updatedOrder,
          });
        }
      }
      if (differenceInHour(matchedOrder.createdAt, Date.now()) >= 2) {
        error.message = 'You are can no longer update this order';
        const updatedOrder = matchedOrder.update({ expired: true });
        return res.status(405).json({
          message: error.message,
          status: 'error',
          error,
          order: updatedOrder,
        });
      }
      // Merge changes
      const updatedOrder = await matchedOrder.update(req.body.validatedOrder);
      const filteredOrder = {
        id: updatedOrder.id,
        quantity: updatedOrder.quantity,
        total: updatedOrder.total,
        status: updatedOrder.status,
        expired: updatedOrder.expired,
        userId: updatedOrder.userId,
        mealId: updatedOrder.mealId,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
      };
      return res.status(200).json({
        message: 'Successfully updated order',
        status: 'success',
        order: filteredOrder,
      });
    }

    error.message = 'You can no longer update this order';
    const updatedOrder = await matchedOrder.update({ expired: true });
    return res.status(405).json({
      message: error.message,
      status: 'error',
      error,
      order: updatedOrder,
    });
  }

  /**
   * @description - Delete a specific order
   * @static
   * @async
   *
   * @param {object} req - HTTP Request
   * @param {object} res - HTTP Response
   *
   * @memberof OrderController
   *
   * @returns {Promise<object>}
   */
  static async deleteOrder(req, res) {
    const error = {};
    // Find Order
    const matchedOrder = await Order.findOne({
      where: { id: req.params.OrderId },
    });

    if (matchedOrder) {
      const deletedOrder = await matchedOrder.destroy();
      return res.status(201).json({
        message: 'Order successfully deleted',
        status: 'success',
        order: deletedOrder,
      });
    }

    error.id = 'Order does not exist';
    return res.status(404).json({
      message: error.id,
      status: 'error',
      error,
    });
  }
}

export default OrderController;
