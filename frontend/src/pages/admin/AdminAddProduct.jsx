import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LoadingPopup from '../../components/LoadingPopup';
import SuccessPopup from '../../components/SuccessPopup';
import toast from 'react-hot-toast';

const categoryOptions = [
  { value: 'airpods', label: 'Airpods / Earbuds' },
  { value: 'handfree', label: 'Handfree' },
  { value: 'mobile-back-covers', label: 'Mobile Back Covers' },
  { value: 'adapters', label: 'Adapters' },
  { value: 'charging-leads', label: 'Charging Leads' },
  { value: 'cooling-fans', label: 'Cooling Fans' },
  { value: 'splitters', label: 'Splitters' },
  { value: 'connectors', label: 'Connectors' },
  { value: 'mobile-watch', label: 'Mobile Watch' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'speakers', label: 'Speakers' },
  { value: 'powerbank', label: 'Powerbank' },
];

const commonColors = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'Silver', hex: '#cbd5e1' },
  { name: 'Gold', hex: '#fbbf24' },
  { name: 'Rose Gold', hex: '#e8b4b8' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Purple', hex: '#9333ea' },
  { name: 'Navy Blue', hex: '#1e3a8a' },
  { name: 'Space Grey', hex: '#4b5563' },
];

const AdminAddProduct = () => {
  const { admin } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '10',
    specifications: '',
  });

  // Color variants state
  // Each variant: { colorName, colorHex, files: [File], previews: [dataUrl] }
  const [colorVariants, setColorVariants] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#000000');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add a new color variant
  const addColorVariant = (colorName, colorHex) => {
    if (colorVariants.find(v => v.colorName === colorName)) {
      toast.error(`${colorName} already added`);
      return;
    }
    setColorVariants([...colorVariants, {
      colorName,
      colorHex,
      files: [],
      previews: [],
    }]);
    setShowColorPicker(false);
    toast.success(`${colorName} added! Now upload images for it.`);
  };

  // Add custom color
  const addCustomColor = () => {
    if (!customColorName.trim()) {
      toast.error('Enter color name');
      return;
    }
    addColorVariant(customColorName.trim(), customColorHex);
    setCustomColorName('');
    setCustomColorHex('#000000');
  };

  // Remove color variant
  const removeColorVariant = (index) => {
    setColorVariants(colorVariants.filter((_, i) => i !== index));
  };

  // Handle image upload for specific color
  const handleImageUpload = (variantIndex, event) => {
    const files = Array.from(event.target.files);

    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB.`);
        return;
      }
    }

    const updatedVariants = [...colorVariants];
    const variant = updatedVariants[variantIndex];

    if (variant.files.length + files.length > 5) {
      toast.error('Max 5 images per color');
      return;
    }

    variant.files = [...variant.files, ...files];

    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        variant.previews = [...variant.previews, reader.result];
        setColorVariants([...updatedVariants]);
      };
      reader.readAsDataURL(file);
    });

    setColorVariants(updatedVariants);
  };

  // Remove image from variant
  const removeVariantImage = (variantIndex, imageIndex) => {
    const updatedVariants = [...colorVariants];
    updatedVariants[variantIndex].files.splice(imageIndex, 1);
    updatedVariants[variantIndex].previews.splice(imageIndex, 1);
    setColorVariants(updatedVariants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (colorVariants.length === 0) {
      toast.error('Please add at least one color with images');
      return;
    }

    // Check each variant has at least 1 image
    for (let variant of colorVariants) {
      if (variant.files.length === 0) {
        toast.error(`Please upload images for ${variant.colorName}`);
        return;
      }
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('brand', formData.brand);
      data.append('stock', formData.stock);
      data.append('specifications', formData.specifications);

      // Prepare all files and track indices
      const allFiles = [];
      const variantsData = [];
      let currentIndex = 0;

      colorVariants.forEach((variant) => {
        const imageIndices = [];
        variant.files.forEach((file) => {
          allFiles.push(file);
          imageIndices.push(currentIndex);
          currentIndex++;
        });

        variantsData.push({
          colorName: variant.colorName,
          colorHex: variant.colorHex,
          imageIndices,
        });
      });

      // Append all files with same field name 'images'
      allFiles.forEach((file) => {
        data.append('images', file);
      });

      // Append variants data as JSON
      data.append('colorVariants', JSON.stringify(variantsData));

      console.log('📤 Sending:', {
        totalFiles: allFiles.length,
        variants: variantsData,
      });

      await axios.post('/api/products', data, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
        },
      });

      setLoading(false);
      setShowSuccess(true);
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  };

  const resetForm = () => {
    setShowSuccess(false);
    setFormData({
      name: '', description: '', price: '', category: '', brand: '', stock: '10', specifications: '',
    });
    setColorVariants([]);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      {loading && <LoadingPopup message="Adding Product..." subMessage="Uploading images and saving details" />}
      {showSuccess && (
        <SuccessPopup
          message="Product Added! 🎉"
          subMessage="Product with color variants has been added"
          buttonText="Add Another"
          onClose={resetForm}
        />
      )}

      <nav className={`border-b px-6 py-4 ${
        theme === 'dark' ? 'bg-[#0d0d1a] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black">
            <span className="gradient-text">ADD PRODUCT</span>
          </h1>
          <div className="flex items-center space-x-4">
            <Link to="/admin/manage-products" className="text-primary hover:underline text-sm">All Products</Link>
            <Link to="/admin/dashboard" className="text-primary hover:underline text-sm">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeInUp">
        <div className={`rounded-2xl p-8 ${
          theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-lg border border-gray-100'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Info */}
            <div>
              <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Product Name *
              </label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="input-field" placeholder="e.g., Ronin R-520 Earbuds" required />
            </div>

            <div>
              <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Description *
              </label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                className="input-field h-32 resize-none" placeholder="Detailed description..." required />
            </div>

            <div>
              <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Specifications (| separated)
              </label>
              <input type="text" name="specifications" value={formData.specifications} onChange={handleChange}
                className="input-field" placeholder="Bluetooth 5.3 | 25hr Battery | IPX4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Price (Rs.) *
                </label>
                <input type="number" name="price" value={formData.price} onChange={handleChange}
                  className="input-field" placeholder="3500" min="0" required />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category *
                </label>
                <select name="category" value={formData.category} onChange={handleChange} className="input-field" required>
                  <option value="">Select Category</option>
                  {categoryOptions.map((cat) => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Brand
                </label>
                <input type="text" name="brand" value={formData.brand} onChange={handleChange}
                  className="input-field" placeholder="Ronin, Zero etc." />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Stock
                </label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange}
                  className="input-field" placeholder="10" min="0" />
              </div>
            </div>

            {/* ===== COLOR VARIANTS SECTION ===== */}
            <div className={`p-6 rounded-2xl border-2 border-dashed ${
              theme === 'dark' ? 'border-primary/30 bg-[#0a0a1a]' : 'border-primary/30 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    🎨 Color Variants
                  </h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Add colors and upload specific images for each color
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="btn-primary text-sm py-2 px-4"
                >
                  {showColorPicker ? 'Close' : '+ Add Color'}
                </button>
              </div>

              {/* Color Picker */}
              {showColorPicker && (
                <div className={`p-4 rounded-xl mb-4 ${
                  theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow border border-gray-200'
                }`}>
                  <p className={`text-sm font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Choose a Color:
                  </p>

                  {/* Common Colors */}
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                    {commonColors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => addColorVariant(color.name, color.hex)}
                        className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                          theme === 'dark' ? 'border-gray-700 hover:border-primary' : 'border-gray-200 hover:border-primary'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full mx-auto mb-1 border-2 border-white shadow"
                          style={{ background: color.hex }}></div>
                        <p className={`text-[10px] text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {color.name}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Custom Color */}
                  <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-[#0a0a1a]' : 'bg-gray-50'}`}>
                    <p className={`text-xs font-bold mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Or add custom color:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customColorName}
                        onChange={(e) => setCustomColorName(e.target.value)}
                        placeholder="Color name"
                        className="input-field flex-1"
                      />
                      <button
                        type="button"
                        onClick={addCustomColor}
                        className="btn-primary text-sm py-2 px-4"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Color Variants List */}
              {colorVariants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">🎨</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    No colors added yet. Click "+ Add Color" to start.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {colorVariants.map((variant, variantIndex) => (
                    <div key={variantIndex} className={`p-4 rounded-xl ${
                      theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow border border-gray-100'
                    }`}>
                      {/* Variant Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
                            style={{ background: variant.colorHex }}></div>
                          <div>
                            <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {variant.colorName}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {variant.files.length} image(s)
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeColorVariant(variantIndex)}
                          className="text-red-500 hover:text-red-600 text-sm font-bold"
                        >
                          Remove Color
                        </button>
                      </div>

                      {/* Image Previews */}
                      {variant.previews.length > 0 && (
                        <div className="grid grid-cols-4 md:grid-cols-5 gap-2 mb-3">
                          {variant.previews.map((preview, imgIndex) => (
                            <div key={imgIndex} className="relative aspect-square rounded-lg overflow-hidden group">
                              <img src={preview} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeVariantImage(variantIndex, imgIndex)}
                                  className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                                >✕</button>
                              </div>
                              {imgIndex === 0 && (
                                <span className="absolute top-1 left-1 bg-primary text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                                  MAIN
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload Button */}
                      <label className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all hover:border-primary ${
                        theme === 'dark' ? 'border-gray-700 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <p className="text-2xl mb-1">📸</p>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          Upload images for {variant.colorName}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {variant.files.length}/5 images
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageUpload(variantIndex, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-lg disabled:opacity-50">
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddProduct;