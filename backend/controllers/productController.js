const Product = require('../models/Product');
const path = require('path');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category, isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
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

// Get all products (admin)
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    console.log(`✅ Admin fetched ${products.length} products`);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============= CREATE PRODUCT =============
exports.createProduct = async (req, res) => {
  try {
    console.log('\n===== CREATE PRODUCT =====');
    console.log('📝 Body keys:', Object.keys(req.body));
    console.log('📁 Files count:', req.files?.length || 0);

    const {
      name, description, tagline, price, originalPrice, category, brand,
      modelNumber, stock, specifications, colorVariants,
      showcaseSections, sectionImageMapping, specGroups,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }

    // Get all uploaded image paths
    const allUploadedImages = req.files.map((file) => {
      if (file.path && file.path.startsWith('http')) return file.path;
      if (file.filename) return `/uploads/${file.filename}`;
      return null;
    }).filter(Boolean);

    console.log('✅ Uploaded images:', allUploadedImages.length);

    // Parse color variants
    let parsedColorVariants = [];
    if (colorVariants) {
      try {
        const variants = typeof colorVariants === 'string'
          ? JSON.parse(colorVariants)
          : colorVariants;

        parsedColorVariants = variants.map((variant) => ({
          colorName: variant.colorName,
          colorHex: variant.colorHex || '#000000',
          images: (variant.imageIndices || []).map(idx => allUploadedImages[idx]).filter(Boolean),
        }));

        console.log('✅ Color variants:', parsedColorVariants.length);
      } catch (e) {
        console.log('⚠️ Color variants parse error:', e.message);
      }
    }

    // Parse spec groups
    let parsedSpecGroups = [];
    if (specGroups) {
      try {
        parsedSpecGroups = typeof specGroups === 'string'
          ? JSON.parse(specGroups)
          : specGroups;
        console.log('✅ Spec groups:', parsedSpecGroups.length);
      } catch (e) {
        console.log('⚠️ Spec groups parse error:', e.message);
      }
    }

    // Parse showcase sections
    let parsedSections = [];
    if (showcaseSections) {
      try {
        const sections = typeof showcaseSections === 'string'
          ? JSON.parse(showcaseSections)
          : showcaseSections;

        const mapping = sectionImageMapping
          ? (typeof sectionImageMapping === 'string' ? JSON.parse(sectionImageMapping) : sectionImageMapping)
          : {};

        parsedSections = sections.map((section, sectionIdx) => {
          const imageIndices = mapping[sectionIdx] || [];
          const newImages = imageIndices.map(idx => allUploadedImages[idx]).filter(Boolean);

          return {
            sectionType: section.sectionType || 'custom',
            title: section.title || '',
            subtitle: section.subtitle || '',
            description: section.description || '',
            images: [...(section.existingImages || []), ...newImages],
            layout: section.layout || 'image-right',
            backgroundColor: section.backgroundColor || '#f5f5f7',
            textColor: section.textColor || '#1a1a2e',
            order: section.order !== undefined ? section.order : sectionIdx,
          };
        });

        console.log('✅ Showcase sections:', parsedSections.length);
      } catch (e) {
        console.log('⚠️ Showcase sections parse error:', e.message);
      }
    }

    const simpleColors = parsedColorVariants.map(v => v.colorName);
    const defaultImages = parsedColorVariants.length > 0 && parsedColorVariants[0].images.length > 0
      ? parsedColorVariants[0].images
      : allUploadedImages;

    const product = await Product.create({
      name,
      description,
      tagline: tagline || '',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : 0,
      category,
      brand: brand || '',
      modelNumber: modelNumber || '',
      specifications: specifications || '',
      specGroups: parsedSpecGroups,
      colors: simpleColors,
      colorVariants: parsedColorVariants,
      stock: stock ? Number(stock) : 10,
      image: defaultImages[0],
      images: defaultImages,
      showcaseSections: parsedSections,
      isSoldOut: false,
      isActive: true,
    });

    console.log('✅ Product created with:');
    console.log('   - Color variants:', product.colorVariants.length);
    console.log('   - Showcase sections:', product.showcaseSections.length);
    console.log('   - Spec groups:', product.specGroups.length);
    console.log('===== CREATE COMPLETE =====\n');

    const io = req.app.get('io');
    if (io) io.emit('product_added', product);

    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Create error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

// ============= UPDATE PRODUCT =============
exports.updateProduct = async (req, res) => {
  try {
    console.log('\n===== UPDATE PRODUCT =====');
    console.log('🆔 Product ID:', req.params.id);
    console.log('📝 Body keys:', Object.keys(req.body));
    console.log('📁 Files count:', req.files?.length || 0);

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      name, description, tagline, price, originalPrice, category, brand,
      modelNumber, stock, specifications,
      colorVariants, existingColorVariants,
      showcaseSections, sectionImageMapping, specGroups,
    } = req.body;

    // Update basic fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (tagline !== undefined) product.tagline = tagline;
    if (price) product.price = Number(price);
    if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
    if (category) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (modelNumber !== undefined) product.modelNumber = modelNumber;
    if (specifications !== undefined) product.specifications = specifications;
    if (stock) product.stock = Number(stock);

    console.log('✅ Basic fields updated');

    // ========== SPEC GROUPS ==========
    if (specGroups !== undefined) {
      try {
        const parsedSpecs = typeof specGroups === 'string'
          ? JSON.parse(specGroups)
          : specGroups;

        product.specGroups = parsedSpecs;
        console.log('✅ Spec groups saved:', parsedSpecs.length);
      } catch (e) {
        console.log('⚠️ Spec groups parse error:', e.message);
      }
    }

    // Get new uploaded images
    const newUploadedImages = req.files && req.files.length > 0
      ? req.files.map((file) => {
          if (file.path && file.path.startsWith('http')) return file.path;
          if (file.filename) return `/uploads/${file.filename}`;
          return null;
        }).filter(Boolean)
      : [];

    console.log('✅ New uploaded images:', newUploadedImages.length);

    // ========== COLOR VARIANTS ==========
    let keptVariants = [];
    if (existingColorVariants) {
      try {
        keptVariants = typeof existingColorVariants === 'string'
          ? JSON.parse(existingColorVariants)
          : existingColorVariants;
        console.log('✅ Kept existing variants:', keptVariants.length);
      } catch (e) {
        console.log('⚠️ existingColorVariants parse error:', e.message);
      }
    }

    let newVariantsData = [];
    if (colorVariants) {
      try {
        const variants = typeof colorVariants === 'string'
          ? JSON.parse(colorVariants)
          : colorVariants;

        newVariantsData = variants.map((variant) => ({
          colorName: variant.colorName,
          colorHex: variant.colorHex || '#000000',
          newImages: (variant.imageIndices || []).map(idx => newUploadedImages[idx]).filter(Boolean),
        }));
        console.log('✅ New variants data:', newVariantsData.length);
      } catch (e) {
        console.log('⚠️ colorVariants parse error:', e.message);
      }
    }

    const finalVariants = keptVariants.map(kept => {
      const matchingNew = newVariantsData.find(nv => nv.colorName === kept.colorName);
      return {
        colorName: kept.colorName,
        colorHex: kept.colorHex,
        images: [...(kept.images || []), ...(matchingNew ? matchingNew.newImages : [])],
      };
    });

    newVariantsData.forEach(nv => {
      const exists = keptVariants.find(k => k.colorName === nv.colorName);
      if (!exists && nv.newImages.length > 0) {
        finalVariants.push({
          colorName: nv.colorName,
          colorHex: nv.colorHex,
          images: nv.newImages,
        });
      }
    });

    product.colorVariants = finalVariants;
    product.colors = finalVariants.map(v => v.colorName);

    if (finalVariants.length > 0 && finalVariants[0].images.length > 0) {
      product.image = finalVariants[0].images[0];
      product.images = finalVariants[0].images;
    }

    console.log('✅ Final color variants:', finalVariants.length);

    // ========== SHOWCASE SECTIONS ==========
    if (showcaseSections !== undefined) {
      try {
        const sections = typeof showcaseSections === 'string'
          ? JSON.parse(showcaseSections)
          : showcaseSections;

        console.log('📸 Received sections:', sections.length);

        const mapping = sectionImageMapping
          ? (typeof sectionImageMapping === 'string' ? JSON.parse(sectionImageMapping) : sectionImageMapping)
          : {};

        console.log('🗺️ Section image mapping:', mapping);

        const finalSections = sections.map((section, sectionIdx) => {
          const imageIndices = mapping[sectionIdx] || [];
          const newImages = imageIndices.map(idx => newUploadedImages[idx]).filter(Boolean);

          console.log(`  Section ${sectionIdx}:`, {
            title: section.title,
            existing: section.existingImages?.length || 0,
            new: newImages.length,
          });

          return {
            sectionType: section.sectionType || 'custom',
            title: section.title || '',
            subtitle: section.subtitle || '',
            description: section.description || '',
            images: [...(section.existingImages || []), ...newImages],
            layout: section.layout || 'image-right',
            backgroundColor: section.backgroundColor || '#f5f5f7',
            textColor: section.textColor || '#1a1a2e',
            order: section.order !== undefined ? section.order : sectionIdx,
          };
        });

        product.showcaseSections = finalSections;
        console.log('✅ Showcase sections saved:', finalSections.length);
      } catch (e) {
        console.log('⚠️ Showcase sections parse error:', e.message);
        console.log('Received value:', showcaseSections);
      }
    } else {
      console.log('⚠️ No showcaseSections in request body');
    }

    console.log('💾 Saving product...');
    const updatedProduct = await product.save();

    console.log('✅ Saved product summary:');
    console.log('   - Name:', updatedProduct.name);
    console.log('   - Color variants:', updatedProduct.colorVariants.length);
    console.log('   - Showcase sections:', updatedProduct.showcaseSections.length);
    console.log('   - Spec groups:', updatedProduct.specGroups.length);
    console.log('===== UPDATE COMPLETE =====\n');

    const io = req.app.get('io');
    if (io) io.emit('product_updated', updatedProduct);

    res.json(updatedProduct);
  } catch (error) {
    console.error('❌ Update error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Product.findByIdAndDelete(req.params.id);
    const io = req.app.get('io');
    if (io) io.emit('product_deleted', req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle sold out
exports.toggleSoldOut = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const wasSoldOut = product.isSoldOut;
    product.isSoldOut = !product.isSoldOut;

    if (wasSoldOut && !product.isSoldOut && product.notifySubscribers?.length > 0) {
      const subscribers = [...product.notifySubscribers];
      product.notifySubscribers = [];
      await product.save();

      const io = req.app.get('io');
      if (io) io.emit('product_updated', product);

      return res.json({
        ...product.toObject(),
        notifiedCount: subscribers.length,
        message: `${subscribers.length} subscribers notified.`,
      });
    }

    await product.save();
    const io = req.app.get('io');
    if (io) io.emit('product_updated', product);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Subscribe notify
exports.subscribeNotify = async (req, res) => {
  try {
    const { email, name, userId } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!product.isSoldOut) return res.status(400).json({ message: 'Product is in stock' });

    if (!product.notifySubscribers) product.notifySubscribers = [];

    const alreadySubscribed = product.notifySubscribers.find(
      (sub) => sub.email.toLowerCase() === email.toLowerCase()
    );

    if (alreadySubscribed) {
      return res.status(400).json({ message: 'Already subscribed' });
    }

    product.notifySubscribers.push({
      email: email.toLowerCase(),
      name: name || '',
      userId: userId || null,
      subscribedAt: new Date(),
    });

    await product.save();
    res.json({ message: 'Subscribed successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get subscribers
exports.getNotifySubscribers = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({
      productName: product.name,
      isSoldOut: product.isSoldOut,
      subscribers: product.notifySubscribers || [],
      count: (product.notifySubscribers || []).length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};