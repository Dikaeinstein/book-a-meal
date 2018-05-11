import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app';
import users from './usersTestData';

const { expect } = chai;
chai.use(chaiHttp);

const orderUrl = '/api/v1/orders';
const signUpUrl = '/api/v1/auth/signup';

const order = {
  mealId: '2',
  amount: '2000',
  quantity: '1',
  total: '2000',
};

const admin = users[4];
const user = users[5];

let token;
let adminToken;

describe('Orders', () => {
  // Setup user(admin)
  before(async () => {
    const res = await chai.request(app).post(signUpUrl)
      .send(admin);
    adminToken = res.body.token;
  });
  // Setup user(customer)
  before(async () => {
    const res = await chai.request(app).post(signUpUrl)
      .send(user);
    token = res.body.token;
  });

  // Test Get all orders
  describe('Get all Orders', () => {
    it('should return an error when array of orders is empty', async () => {
      const res = await chai.request(app).get(orderUrl)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).to.equal(404);
      expect(res.body).to.be.an('object');
      expect(res.body.message).to
        .include('No order have been placed');
    });
    it('should return an array', async () => {
      await chai.request(app).post(orderUrl)
        .set('Authorization', `Bearer ${token}`)
        .send(order);
      const res = await chai.request(app).get(orderUrl)
        .set('Authorization', `Bearer ${adminToken}`);
      const expectedOrder = res.body.orders[0];
      expect(res.status).to.equal(200);
      expect(res.body.orders).to.be.an('array');
      expect(expectedOrder.total).to.equal('2000');
    });
  });

  // Test Post an order
  describe('Post an order', () => {
    it('should allow auth customers place an order', async () => {
      const res = await chai.request(app).post(orderUrl)
        .set('Authorization', `Bearer ${token}`)
        .send(order);
      expect(res.status).to.equal(201);
      expect(res.body).to.be.an('object');
      expect(res.body.status).to.equal('success');
      expect(res.body.order).to.be.an('object');
      expect(res.body.order.total).to.equal(order.total);
      expect(res.body.order.quantity).to.equal(parseInt(order.quantity, 10));
      expect(res.body.order.status).to.equal('pending');
    });
    it('should not allow non auth customers to post an order', async () => {
      const res = await chai.request(app).post(orderUrl)
        .send(order);
      expect(res.status).to.equal(401);
      expect(res.body).to.be.an('object');
      expect(res.body.error.token).to
        .include('No token provided');
    });
    it('should post an order without userId in request body', async () => {
      const res = await chai.request(app).post(orderUrl)
        .set('Authorization', `Bearer ${token}`)
        .send(order);
      expect(res.status).to.equal(201);
      expect(res.body).to.be.an('object');
      expect(res.body.status).to.equal('success');
      expect(res.body.message).to.equal('Order placed');
    });
    it('should not post an order with an invalid quantity', async () => {
      const res = await chai.request(app).post(orderUrl)
        .set('Authorization', `Bearer ${token}`)
        .send({
          mealId: '2',
          amount: '2000',
          quantity: '-3',
          total: '2000',
        });
      expect(res.status).to.equal(400);
      expect(res.body.error.quantity).to
        .include('Order quantity cannot be less than zero');
    });
  });

  // Test Update an order
  describe('Update an order', () => {
    it('should allow auth customers update their order', async () => {
      const res = await chai.request(app).put(`${orderUrl}/1`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          quantity: '2',
          total: '4000',
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.status).to.equal('success');
      expect(res.body.order).to.be.an('object');
      expect(res.body.order.quantity).to.equal('2');
      expect(res.body.order.total).to.equal('4000');
    });
    it('should not allow non auth customers update their order', async () => {
      const res = await chai.request(app).put(`${orderUrl}/1`)
        .send({
          quantity: 2,
          total: 4000,
        });
      expect(res.status).to.equal(401);
      expect(res.body).to.be.an('object');
      expect(res.body.error.token).to.include('No token provided');
    });
    describe('Modify an expired order', () => {
      before((done) => {
        setTimeout(() => {
          done();
        }, 3000);
      });
      it('should not modify an order after 2 secs', async () => {
        const res = await chai.request(app).put(`${orderUrl}/1`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            quantity: '1',
            total: '2000',
          });
        expect(res.status).to.equal(405);
        expect(res.body.error.message).to
          .include('You can no longer update this order');
      });
    });
  });

  // Test Get order total amount for specific day
  describe('Get total amount made', () => {
    it('should return total for current day', async () => {
      const res = await chai.request(app).get(`${orderUrl}/total`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.total).to.equal(8000);
    });
    it('should not retrieve total for non admin user', async () => {
      const res = await chai.request(app).get(`${orderUrl}/total`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(403);
      expect(res.body).to.be.an('object');
      expect(res.body.error.message).to
        .equal("Forbidden, you don't have the priviledge to perform this operation");
    });
  });

  // Test Get order history for specific user
  describe('Get orders for specific user', () => {
    // Admin can get order history for specific user
    it('should get orders for specific auth user with userId', async () => {
      const res = await chai.request(app).get(`${orderUrl}/users/1`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body.status).to.equal('success');
      expect(res.body.orders).to.be.an('array');
    });
  });
});