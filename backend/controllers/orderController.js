const Order = require('../models/Order');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// @desc    Create order
exports.createOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, customerAddress, customerCity, items } = req.body;

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryCharges = 700;
    const totalAmount = subtotal + deliveryCharges;

    const order = await Order.create({
      user: req.user._id,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      items,
      subtotal,
      deliveryCharges,
      totalAmount,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          date: new Date(),
          estimatedDays: 0,
        },
      ],
    });

    // Clear user cart
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save({ validateBeforeSave: false });

    // Generate receipt HTML
    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #1a1a3e; color: #e0e0e0;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #1a1a3e; text-align: center; color: #e0e0e0;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #1a1a3e; text-align: right; color: #e0e0e0;">Rs. ${item.price.toLocaleString()}</td>
        <td style="padding: 12px; border-bottom: 1px solid #1a1a3e; text-align: right; color: #e94560; font-weight: bold;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
      )
      .join('');

    // Send confirmation email
    const mailOptions = {
      from: `"THE ACCESSORIES LAB" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Order Confirmed - ${order.trackingId} | THE ACCESSORIES LAB`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #0a0a0f; border-radius: 20px; overflow: hidden; border: 1px solid #1a1a3e;">
          
          <div style="background: linear-gradient(135deg, #e94560, #c23152, #0f3460); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: #fff; font-size: 28px; font-weight: 900; letter-spacing: 1px;">THE ACCESSORIES LAB</h1>
            <p style="color: rgba(255,255,255,0.8); margin-top: 8px; font-size: 14px;">Your Order Has Been Confirmed! 🎉</p>
          </div>
          
          <div style="padding: 30px;">
            
            <div style="background: linear-gradient(135deg, #12122a, #1a1a3e); border-radius: 15px; padding: 20px; margin-bottom: 25px; border: 1px solid #e94560;">
              <p style="color: #e94560; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Tracking ID</p>
              <p style="color: #fff; font-size: 24px; font-weight: 900; letter-spacing: 3px; margin: 0;">${order.trackingId}</p>
              <p style="color: #888; font-size: 11px; margin-top: 8px;">Use this ID to track your order on our website</p>
            </div>

            <div style="display: flex; gap: 15px; margin-bottom: 25px;">
              <div style="flex: 1; background: #12122a; border-radius: 12px; padding: 15px;">
                <p style="color: #888; font-size: 11px; margin: 0;">Customer</p>
                <p style="color: #fff; font-weight: 600; margin: 5px 0 0 0;">${customerName}</p>
              </div>
              <div style="flex: 1; background: #12122a; border-radius: 12px; padding: 15px;">
                <p style="color: #888; font-size: 11px; margin: 0;">Phone</p>
                <p style="color: #fff; font-weight: 600; margin: 5px 0 0 0;">${customerPhone}</p>
              </div>
            </div>

            <div style="background: #12122a; border-radius: 12px; padding: 15px; margin-bottom: 25px;">
              <p style="color: #888; font-size: 11px; margin: 0;">Delivery Address</p>
              <p style="color: #fff; font-weight: 600; margin: 5px 0 0 0;">${customerAddress}, ${customerCity}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <thead>
                <tr style="background: #12122a;">
                  <th style="padding: 12px; text-align: left; color: #e94560; font-size: 12px; text-transform: uppercase;">Item</th>
                  <th style="padding: 12px; text-align: center; color: #e94560; font-size: 12px; text-transform: uppercase;">Qty</th>
                  <th style="padding: 12px; text-align: right; color: #e94560; font-size: 12px; text-transform: uppercase;">Price</th>
                  <th style="padding: 12px; text-align: right; color: #e94560; font-size: 12px; text-transform: uppercase;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="background: linear-gradient(135deg, #12122a, #1a1a3e); border-radius: 15px; padding: 20px; border: 1px solid #1a1a3e;">
              <div style="margin-bottom: 10px;">
                <span style="color: #888;">Subtotal:</span>
                <span style="color: #fff; float: right;">Rs. ${subtotal.toLocaleString()}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <span style="color: #888;">Delivery Charges:</span>
                <span style="color: #fff; float: right;">Rs. ${deliveryCharges}</span>
              </div>
              <div style="border-top: 1px solid #333; padding-top: 15px;">
                <span style="color: #fff; font-size: 20px; font-weight: 900;">Total:</span>
                <span style="color: #e94560; font-size: 20px; font-weight: 900; float: right;">Rs. ${totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div style="background: #12122a; border-radius: 15px; padding: 20px; margin-top: 25px; text-align: center;">
              <p style="color: #e94560; font-weight: bold; margin: 0 0 10px 0;">📦 Order Status Timeline</p>
              <p style="color: #888; font-size: 13px; margin: 0;">
                Order Placed → Dispatch (2-3 days) → Out for Delivery (2-3 days) → Completed
              </p>
            </div>
            
            <p style="text-align: center; margin-top: 25px; color: #555; font-size: 12px;">
              Thank you for shopping with THE ACCESSORIES LAB!<br>
              For any queries, reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Emit socket event for admin
    const io = req.app.get('io');
    io.to('admin_room').emit('new_order', order);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track order by tracking ID
exports.trackOrder = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const order = await Order.findOne({ trackingId: trackingId.toUpperCase() });

    if (!order) {
      return res.status(404).json({ message: 'Order not found. Please check your tracking ID.' });
    }

    res.json({
      trackingId: order.trackingId,
      status: order.status,
      statusHistory: order.statusHistory,
      items: order.items,
      totalAmount: order.totalAmount,
      deliveryCharges: order.deliveryCharges,
      subtotal: order.subtotal,
      customerName: order.customerName,
      customerCity: order.customerCity,
      createdAt: order.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin) - With timeline
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status } = req.body;
    order.status = status;

    // Estimated days for each status
    const estimatedDays = {
      pending: 0,
      dispatch: 3,
      delivery: 3,
      completed: 0,
      cancelled: 0,
    };

    order.statusHistory.push({
      status,
      date: new Date(),
      estimatedDays: estimatedDays[status] || 0,
    });

    // If completed, send completion email
    if (status === 'completed') {
      const mailOptions = {
        from: `"THE ACCESSORIES LAB" <${process.env.SMTP_USER}>`,
        to: order.customerEmail,
        subject: `Order Delivered - ${order.trackingId} | THE ACCESSORIES LAB`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; border-radius: 20px; overflow: hidden; border: 1px solid #1a1a3e;">
            <div style="background: linear-gradient(135deg, #27ae60, #2ecc71); padding: 40px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 28px;">Order Delivered! 🎉</h1>
              <p style="color: rgba(255,255,255,0.8); margin-top: 8px;">Tracking: ${order.trackingId}</p>
            </div>
            <div style="padding: 30px; text-align: center;">
              <p style="color: #fff; font-size: 18px;">Dear ${order.customerName},</p>
              <p style="color: #888;">Your order has been successfully delivered. Thank you for shopping with us!</p>
              <p style="color: #e94560; font-weight: bold; font-size: 20px; margin-top: 20px;">Total: Rs. ${order.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
    }

    // If dispatch, send dispatch email
    if (status === 'dispatch') {
      const mailOptions = {
        from: `"THE ACCESSORIES LAB" <${process.env.SMTP_USER}>`,
        to: order.customerEmail,
        subject: `Order Dispatched - ${order.trackingId} | THE ACCESSORIES LAB`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; border-radius: 20px; overflow: hidden; border: 1px solid #1a1a3e;">
            <div style="background: linear-gradient(135deg, #e94560, #f39c12); padding: 40px; text-align: center;">
              <h1 style="color: #fff; margin: 0;">Order Dispatched! 📦</h1>
              <p style="color: rgba(255,255,255,0.8); margin-top: 8px;">Tracking: ${order.trackingId}</p>
            </div>
            <div style="padding: 30px; text-align: center;">
              <p style="color: #fff; font-size: 18px;">Dear ${order.customerName},</p>
              <p style="color: #888;">Your order has been dispatched and will be delivered in 2-3 business days.</p>
              <p style="color: #888;">Delivery Address: ${order.customerAddress}, ${order.customerCity}</p>
            </div>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
    }

    // If delivery (out for delivery), send email
    if (status === 'delivery') {
      const mailOptions = {
        from: `"THE ACCESSORIES LAB" <${process.env.SMTP_USER}>`,
        to: order.customerEmail,
        subject: `Out for Delivery - ${order.trackingId} | THE ACCESSORIES LAB`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; border-radius: 20px; overflow: hidden; border: 1px solid #1a1a3e;">
            <div style="background: linear-gradient(135deg, #3498db, #2ecc71); padding: 40px; text-align: center;">
              <h1 style="color: #fff; margin: 0;">Out for Delivery! 🚚</h1>
              <p style="color: rgba(255,255,255,0.8); margin-top: 8px;">Tracking: ${order.trackingId}</p>
            </div>
            <div style="padding: 30px; text-align: center;">
              <p style="color: #fff; font-size: 18px;">Dear ${order.customerName},</p>
              <p style="color: #888;">Your order is out for delivery! Expected delivery within 2-3 days.</p>
              <p style="color: #888;">Delivery Address: ${order.customerAddress}, ${order.customerCity}</p>
            </div>
          </div>
        `,
      };
      await transporter.sendMail(mailOptions);
    }

    const updatedOrder = await order.save();

    const io = req.app.get('io');
    io.emit('order_updated', updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};