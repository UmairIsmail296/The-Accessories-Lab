const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Configuration
const USE_ONLY_SAMPLES = false; // true karo agar internet slow hai

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    process.exit(1);
  }
};

const extractPrice = (priceText) => {
  if (!priceText) return 0;
  const cleaned = priceText.replace(/[^\d.]/g, '');
  return parseInt(cleaned) || 0;
};

// Scraper for Ronin.pk (UPDATED URLS)
const scrapeRonin = async () => {
  console.log('\n🔵 Scraping Ronin.pk...');
  const products = [];

  const ronincategories = [
    { url: 'https://ronin.pk/collections/earbuds', category: 'airpods', brand: 'Ronin' },
    { url: 'https://ronin.pk/collections/wireless-earbuds', category: 'airpods', brand: 'Ronin' },
    { url: 'https://ronin.pk/collections/hands-free', category: 'handfree', brand: 'Ronin' },
    { url: 'https://ronin.pk/collections/handsfree', category: 'handfree', brand: 'Ronin' },
    { url: 'https://ronin.pk/collections/headphones', category: 'headphones', brand: 'Ronin' },
    { url: 'https://ronin.pk/collections/speakers', category: 'speakers', brand: 'Ronin' },
    { url: 'https://ronin.pk/collections/power-bank', category: 'powerbank', brand: 'Ronin' },
    { url: 'https://ronin.pk/collections/powerbank', category: 'powerbank', brand: 'Ronin' },
    { url: 'https://ronin.pk/collections/smart-watch', category: 'mobile-watch', brand: 'Ronin' },
    { url: 'https://ronin.pk/collections/smartwatch', category: 'mobile-watch', brand: 'Ronin' },
    { url: 'https://ronin.pk/collections/all', category: 'airpods', brand: 'Ronin' },
  ];

  for (const cat of ronincategories) {
    try {
      console.log(`  Fetching ${cat.url.split('/').pop()}...`);
      const { data } = await axios.get(cat.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(data);
      let foundCount = 0;

      $('.product-card, .grid__item, .product-item, .card, .product').each((i, el) => {
        try {
          const name = $(el).find('.product-card__title, .card__heading, .product-item__title, h3, h4, .product-title').first().text().trim();
          const priceText = $(el).find('.price, .product-price, .money, .price-item').first().text().trim();
          let image = $(el).find('img').first().attr('src') ||
                      $(el).find('img').first().attr('data-src') ||
                      $(el).find('img').first().attr('data-srcset')?.split(' ')[0];

          if (image && image.startsWith('//')) image = 'https:' + image;
          if (image && !image.startsWith('http')) image = 'https://ronin.pk' + image;

          const price = extractPrice(priceText);

          if (name && price > 0 && image && name.length > 3) {
            products.push({
              name: name.substring(0, 100),
              description: `${name} - Premium quality from Ronin Pakistan. Available with full warranty and fast delivery.`,
              price,
              category: cat.category,
              brand: cat.brand,
              image,
              images: [image],
              stock: Math.floor(Math.random() * 30) + 10,
            });
            foundCount++;
          }
        } catch (err) { /* skip */ }
      });

      console.log(`  ✅ Found ${foundCount} products`);
    } catch (error) {
      console.log(`  ⚠️ Could not fetch: ${error.message}`);
    }
  }

  return products;
};

// Scraper for Zero Lifestyle (CORRECTED URL: .com instead of .co)
const scrapeZero = async () => {
  console.log('\n🟢 Scraping ZeroLifestyle.com...');
  const products = [];

  const zerocategories = [
    { url: 'https://zerolifestyle.co/collections/all', category: 'airpods', brand: 'Zero' },
    { url: 'https://zerolifestyle.co/collections/earbuds', category: 'airpods', brand: 'Zero' },
    { url: 'https://zerolifestyle.co/collections/speakers', category: 'speakers', brand: 'Zero' },
    { url: 'https://zerolifestyle.co/collections/smartwatch', category: 'mobile-watch', brand: 'Zero' },
    { url: 'https://zerolifestyle.co/collections/watches', category: 'mobile-watch', brand: 'Zero' },
    { url: 'https://zerolifestyle.co/collections/headphones', category: 'headphones', brand: 'Zero' },
    { url: 'https://zerolifestyle.pk/collections/all', category: 'airpods', brand: 'Zero' },
  ];

  for (const cat of zerocategories) {
    try {
      console.log(`  Fetching ${cat.url.split('/').pop()}...`);
      const { data } = await axios.get(cat.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(data);
      let foundCount = 0;

      $('.product-card, .grid__item, .product-item, .card-wrapper, .product').each((i, el) => {
        try {
          const name = $(el).find('.card__heading, .product-card__title, h3, h4, .product-title').first().text().trim();
          const priceText = $(el).find('.price__regular, .price, .money, .product-price, .price-item').first().text().trim();
          let image = $(el).find('img').first().attr('src') ||
                      $(el).find('img').first().attr('data-src') ||
                      $(el).find('img').first().attr('srcset')?.split(' ')[0];

          if (image && image.startsWith('//')) image = 'https:' + image;
          if (image && !image.startsWith('http')) image = 'https://zerolifestyle.co' + image;

          const price = extractPrice(priceText);

          if (name && price > 0 && image && name.length > 3) {
            products.push({
              name: name.substring(0, 100),
              description: `${name} - Premium lifestyle accessory from Zero Pakistan. Modern design with quality assurance.`,
              price,
              category: cat.category,
              brand: cat.brand,
              image,
              images: [image],
              stock: Math.floor(Math.random() * 30) + 10,
            });
            foundCount++;
          }
        } catch (err) { /* skip */ }
      });

      console.log(`  ✅ Found ${foundCount} products`);
    } catch (error) {
      console.log(`  ⚠️ Could not fetch: ${error.message}`);
    }
  }

  return products;
};

// Scraper for XcessoriesHub (UPDATED URLs)
const scrapeXcessoriesHub = async () => {
  console.log('\n🟡 Scraping XcessoriesHub.com...');
  const products = [];

  const xcessoriesCategories = [
    { url: 'https://xcessorieshub.com/shop/', category: 'adapters', brand: 'XcessoriesHub' },
    { url: 'https://xcessorieshub.com/product-category/chargers/', category: 'adapters', brand: 'XcessoriesHub' },
    { url: 'https://xcessorieshub.com/product-category/cables/', category: 'charging-leads', brand: 'XcessoriesHub' },
    { url: 'https://xcessorieshub.com/product-category/mobile-covers/', category: 'mobile-back-covers', brand: 'XcessoriesHub' },
    { url: 'https://xcessorieshub.com/product-category/back-covers/', category: 'mobile-back-covers', brand: 'XcessoriesHub' },
    { url: 'https://xcessorieshub.com/product-category/cooling-fans/', category: 'cooling-fans', brand: 'XcessoriesHub' },
    { url: 'https://xcessorieshub.com/product-category/connectors/', category: 'connectors', brand: 'XcessoriesHub' },
    { url: 'https://xcessorieshub.com/product-category/splitters/', category: 'splitters', brand: 'XcessoriesHub' },
    { url: 'https://xcessorieshub.com/product-category/power-banks/', category: 'powerbank', brand: 'XcessoriesHub' },
  ];

  for (const cat of xcessoriesCategories) {
    try {
      console.log(`  Fetching ${cat.url.split('/').slice(-2).join('/')}...`);
      const { data } = await axios.get(cat.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(data);
      let foundCount = 0;

      $('.product, li.product, .product-item, .product-small').each((i, el) => {
        try {
          const name = $(el).find('.woocommerce-loop-product__title, .name a, h2, h3, .product-title').first().text().trim();
          const priceText = $(el).find('.price, .amount, .woocommerce-Price-amount').first().text().trim();
          let image = $(el).find('img').first().attr('src') ||
                      $(el).find('img').first().attr('data-src') ||
                      $(el).find('img').first().attr('data-lazy-src');

          if (image && image.startsWith('//')) image = 'https:' + image;

          const price = extractPrice(priceText);

          if (name && price > 0 && image && name.length > 3) {
            products.push({
              name: name.substring(0, 100),
              description: `${name} - Available at XcessoriesHub. Quality accessories at affordable prices with fast delivery.`,
              price,
              category: cat.category,
              brand: cat.brand,
              image,
              images: [image],
              stock: Math.floor(Math.random() * 50) + 20,
            });
            foundCount++;
          }
        } catch (err) { /* skip */ }
      });

      console.log(`  ✅ Found ${foundCount} products`);
    } catch (error) {
      console.log(`  ⚠️ Could not fetch: ${error.message}`);
    }
  }

  return products;
};

// Remove duplicates based on name
const removeDuplicates = (products) => {
  const seen = new Set();
  return products.filter((product) => {
    const key = product.name.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Main function
const runScraper = async () => {
  await connectDB();

  console.log('\n🚀 Starting Product Scraper...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let allProducts = [];
  const sampleProducts = require('./sampleProducts');

  // ALWAYS add sample products first (guaranteed 100+ products)
  console.log('\n📦 Loading sample products as base...');
  allProducts = [...sampleProducts];
  console.log(`  ✅ ${sampleProducts.length} sample products loaded`);

  if (!USE_ONLY_SAMPLES) {
    try {
      const roninProducts = await scrapeRonin();
      allProducts = [...allProducts, ...roninProducts];

      const zeroProducts = await scrapeZero();
      allProducts = [...allProducts, ...zeroProducts];

      const xcessoriesProducts = await scrapeXcessoriesHub();
      allProducts = [...allProducts, ...xcessoriesProducts];
    } catch (error) {
      console.log('\n⚠️ Some scrapers failed, but sample products are loaded.');
    }
  }

  // Remove duplicates
  allProducts = removeDuplicates(allProducts);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Total unique products: ${allProducts.length}`);

  try {
    console.log('\n🗑️ Clearing old products...');
    await Product.deleteMany({});
    console.log('✅ Old products cleared');

    console.log('\n💾 Saving products to database...');
    const result = await Product.insertMany(allProducts);
    console.log(`✅ ${result.length} products saved successfully!`);

    console.log('\n📊 Products by Category:');
    const categoryCount = {};
    result.forEach((p) => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });
    Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat.padEnd(20)} ${count} products`);
      });

    console.log('\n📊 Products by Brand:');
    const brandCount = {};
    result.forEach((p) => {
      brandCount[p.brand] = (brandCount[p.brand] || 0) + 1;
    });
    Object.entries(brandCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([brand, count]) => {
        console.log(`  ${brand.padEnd(20)} ${count} products`);
      });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Scraping completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error saving products:', error);
    process.exit(1);
  }
};

runScraper();