const Product = require('../models/Product');
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

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category, isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product - Cloudinary URLs
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, stock, specifications, colors } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }

    // Cloudinary returns URL in file.path
    const imagePaths = req.files.map((file) => file.path);

    let colorsArray = [];
    if (colors) {
      try {
        colorsArray = typeof colors === 'string' ? JSON.parse(colors) : colors;
      } catch (e) {
        colorsArray = colors.split(',').map(c => c.trim()).filter(Boolean);
      }
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      brand: brand || '',
      specifications: specifications || '',
      colors: colorsArray,
      stock: stock ? Number(stock) : 10,
      image: imagePaths[0],
      images: imagePaths,
      isSoldOut: false,
    });

    const io = req.app.get('io');
    io.emit('product_added', product);

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update product - Cloudinary URLs
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, price, category, brand, stock, specifications, colors, existingImages } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price ? Number(price) : product.price;
    product.category = category || product.category;
    product.brand = brand !== undefined ? brand : product.brand;
    product.specifications = specifications !== undefined ? specifications : product.specifications;
    product.stock = stock ? Number(stock) : product.stock;

    if (colors) {
      try {
        product.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      } catch (e) {
        product.colors = colors.split(',').map(c => c.trim()).filter(Boolean);
      }
    }

    let keepImages = [];
    if (existingImages) {
      try {
        keepImages = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
      } catch (e) {
        keepImages = [];
      }
    }

    // Cloudinary URLs from req.files
    let newImagePaths = [];
    if (req.files && req.files.length > 0) {
      newImagePaths = req.files.map((file) => file.path);
    }

    const allImages = [...keepImages, ...newImagePaths];
    if (allImages.length > 0) {
      product.image = allImages[0];
      product.images = allImages;
    }

    const updatedProduct = await product.save();

    const io = req.app.get('io');
    io.emit('product_updated', updatedProduct);

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await Product.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    io.emit('product_deleted', req.params.id);

    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============= SOLD OUT FEATURE =============

// Toggle Sold Out Status (Admin)
exports.toggleSoldOut = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const wasSoldOut = product.isSoldOut;
    product.isSoldOut = !product.isSoldOut;

    // If marking BACK in stock (was sold out, now available)
    if (wasSoldOut && !product.isSoldOut && product.notifySubscribers.length > 0) {
      // Send emails to all subscribers
      const subscribers = [...product.notifySubscribers];

      // Clear subscribers list
      product.notifySubscribers = [];
      await product.save();

      // Send notification emails (async, don't wait)
      sendBackInStockEmails(product, subscribers).catch((err) => {
        console.error('Email sending error:', err);
      });

      const io = req.app.get('io');
      io.emit('product_updated', product);

      return res.json({
        ...product.toObject(),
        notifiedCount: subscribers.length,
        message: `Product is back in stock! ${subscribers.length} subscribers notified.`,
      });
    }

    await product.save();

    const io = req.app.get('io');
    io.emit('product_updated', product);

    res.json(product);
  } catch (error) {
    console.error('Toggle sold out error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Subscribe to Notify Me
exports.subscribeNotify = async (req, res) => {
  try {
    const { email, name, userId } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isSoldOut) {
      return res.status(400).json({ message: 'Product is already in stock' });
    }

    // Check if email already subscribed
    const alreadySubscribed = product.notifySubscribers.find(
      (sub) => sub.email.toLowerCase() === email.toLowerCase()
    );

    if (alreadySubscribed) {
      return res.status(400).json({ message: 'You are already subscribed for notifications' });
    }

    product.notifySubscribers.push({
      email: email.toLowerCase(),
      name: name || '',
      userId: userId || null,
      subscribedAt: new Date(),
    });

    await product.save();

    // Send confirmation email
    try {
      await sendSubscriptionEmail(product, email, name);
    } catch (emailError) {
      console.log('Confirmation email failed:', emailError.message);
    }

    res.json({
      message: 'You will be notified when this product is back in stock!',
      subscribersCount: product.notifySubscribers.length,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============= EMAIL HELPER FUNCTIONS =============

// Send confirmation email when user subscribes
const sendSubscriptionEmail = async (product, email, name) => {
  const productImage = product.image?.startsWith('http')
    ? product.image
    : `${process.env.FRONTEND_URL?.replace('5173', '5000')}${product.image}`;

  await transporter.sendMail({
    from: `"THE ACCESSORIES LAB" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Notification Set ✓ - ${product.name}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; border-radius: 20px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #e94560, #c23152); padding: 40px; text-align: center;">
          <div style="font-size: 60px; margin-bottom: 10px;">🔔</div>
          <h1 style="color: #fff; margin: 0; font-size: 28px;">You're on the List!</h1>
        </div>

        <div style="padding: 30px;">
          <p style="color: #fff; font-size: 18px; text-align: center;">
            Hi <strong>${name || 'there'}</strong>,
          </p>

          <p style="color: #ccc; font-size: 16px; text-align: center; line-height: 1.6;">
            We'll notify you as soon as <strong style="color: #e94560;">${product.name}</strong> is back in stock!
          </p>

          <div style="background: #12122a; border-radius: 15px; padding: 20px; margin: 25px 0; text-align: center;">
            <p style="color: #e94560; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">Product</p>
            <h2 style="color: #fff; margin: 0 0 10px 0; font-size: 22px;">${product.name}</h2>
            <p style="color: #888; margin: 0 0 15px 0;">${product.brand || 'Premium'}</p>
            <div style="background: #e94560; display: inline-block; padding: 8px 20px; border-radius: 8px;">
              <span style="color: #fff; font-weight: bold;">Rs. ${product.price.toLocaleString()}</span>
            </div>
          </div>

          <p style="color: #ccc; text-align: center; font-size: 14px;">
            You'll receive an email the moment this product becomes available again.
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}" style="display: inline-block; background: #e94560; color: white; padding: 14px 30px; border-radius: 10px; text-decoration: none; font-weight: bold;">
              Explore More Products
            </a>
          </div>

          <p style="text-align: center; margin-top: 25px; color: #555; font-size: 12px;">
            THE ACCESSORIES LAB | WhatsApp: 0342-7600786
          </p>
        </div>
      </div>
    `,
  });
};

// Send back-in-stock emails to all subscribers
const sendBackInStockEmails = async (product, subscribers) => {
  const productLink = `${process.env.FRONTEND_URL}/product/${product._id}`;

  for (const subscriber of subscribers) {
    try {
      await transporter.sendMail({
        from: `"THE ACCESSORIES LAB" <${process.env.SMTP_USER}>`,
        to: subscriber.email,
        subject: `🎉 Back in Stock - ${product.name}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; border-radius: 20px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #27ae60, #2ecc71); padding: 40px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 10px;">🎉</div>
              <h1 style="color: #fff; margin: 0; font-size: 28px;">Back in Stock!</h1>
            </div>

            <div style="padding: 30px;">
              <p style="color: #fff; font-size: 18px; text-align: center;">
                Hi <strong>${subscriber.name || 'there'}</strong>,
              </p>

              <p style="color: #ccc; font-size: 16px; text-align: center; line-height: 1.6; margin-bottom: 25px;">
                Great news! The product you wanted is now available.
              </p>

              <div style="background: linear-gradient(135deg, #12122a, #1a1a3e); border-radius: 15px; padding: 25px; margin: 25px 0; text-align: center; border: 2px solid #27ae60;">
                <p style="color: #27ae60; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 3px; font-weight: bold;">Available Now</p>
                <h2 style="color: #fff; margin: 0 0 10px 0; font-size: 24px;">${product.name}</h2>
                <p style="color: #888; margin: 0 0 20px 0; font-size: 14px;">${product.brand || 'Premium Quality'}</p>

                <div style="background: #e94560; display: inline-block; padding: 12px 30px; border-radius: 10px; margin-bottom: 20px;">
                  <span style="color: #fff; font-weight: bold; font-size: 22px;">Rs. ${product.price.toLocaleString()}</span>
                </div>

                <p style="color: #ccc; margin: 0; font-size: 14px;">
                  ⚡ Limited stock available - Order now!
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${productLink}" style="display: inline-block; background: linear-gradient(135deg, #e94560, #c23152); color: white; padding: 18px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 10px 20px rgba(233,69,96,0.3);">
                  🛒 Shop Now
                </a>
              </div>

              <div style="margin-top: 30px; padding: 20px; background: #12122a; border-radius: 12px; text-align: center;">
                <p style="color: #e94560; font-weight: bold; margin: 0 0 10px 0; font-size: 14px;">⏰ Don't Wait!</p>
                <p style="color: #888; margin: 0; font-size: 13px;">
                  Popular items sell out quickly. Place your order today to avoid disappointment.
                </p>
              </div>

              <p style="text-align: center; margin-top: 25px; color: #555; font-size: 12px;">
                THE ACCESSORIES LAB | WhatsApp: 0342-7600786<br>
                You received this because you subscribed to be notified.
              </p>
            </div>
          </div>
        `,
      });
      console.log(`✅ Back-in-stock email sent to ${subscriber.email}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${subscriber.email}:`, error.message);
    }
  }
};

// Get notify subscribers (Admin)
exports.getNotifySubscribers = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({
      productName: product.name,
      isSoldOut: product.isSoldOut,
      subscribers: product.notifySubscribers,
      count: product.notifySubscribers.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};