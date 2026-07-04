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

const AdminAddProduct = () => {
  const { admin } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '10',
    specifications: '',
    colors: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + imageFiles.length > 10) {
      toast.error('Maximum 10 images allowed!');
      return;
    }

    // Validate file size (5MB max each)
    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB per image.`);
        return;
      }
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
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

      // Convert colors string to array (comma separated)
      if (formData.colors) {
        const colorsArray = formData.colors.split(',').map(c => c.trim()).filter(Boolean);
        data.append('colors', JSON.stringify(colorsArray));
      }

      // IMPORTANT: Field name MUST be 'images' (matches backend upload.array('images'))
      imageFiles.forEach((file) => {
        data.append('images', file);
      });

      await axios.post('/api/products', data, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
          'Content-Type': 'multipart/form-data',
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
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      stock: '10',
      specifications: '',
      colors: '',
    });
    setImageFiles([]);
    setImagePreviews([]);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      {loading && (
        <LoadingPopup
          message="Adding Product..."
          subMessage="Uploading images and saving product details"
        />
      )}

      {showSuccess && (
        <SuccessPopup
          message="Product Added! 🎉"
          subMessage="Product has been published and is now visible to customers"
          buttonText="Add Another Product"
          onClose={resetForm}
        />
      )}

      {/* Admin Nav */}
      <nav className={`border-b px-6 py-4 ${
        theme === 'dark' ? 'bg-[#0d0d1a] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black">
            <span className="gradient-text">ADD PRODUCT</span>
          </h1>
          <div className="flex items-center space-x-4">
            <Link to="/admin/manage-products" className="text-primary hover:underline text-sm font-medium">
              All Products
            </Link>
            <Link to="/admin/dashboard" className="text-primary hover:underline text-sm font-medium">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadeInUp">
        <div className={`rounded-2xl p-8 ${
          theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow-lg border border-gray-100'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Multi Image Upload */}
            <div>
              <label className={`block text-sm font-bold mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Product Images (Select multiple - Max 10) *
              </label>

              {/* Image Previews Grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden animate-scaleIn">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-primary text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                          MAIN
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area */}
              <label className={`block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 hover:border-primary ${
                theme === 'dark' ? 'border-gray-700 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <div>
                  <p className="text-4xl mb-2">📸</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Click to upload images
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    JPG, PNG, WEBP (Max 5MB each) — {imageFiles.length}/10 selected
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Product Name */}
            <div>
              <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Ronin R-520 Earbuds"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field h-32 resize-none"
                placeholder="Detailed product description..."
                required
              />
            </div>

            {/* Specifications */}
            <div>
              <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Specifications (Separate with | )
              </label>
              <input
                type="text"
                name="specifications"
                value={formData.specifications}
                onChange={handleChange}
                className="input-field"
                placeholder="Bluetooth 5.3 | 25hr Battery | IPX4 | Touch Controls"
              />
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Use | (pipe) to separate each spec
              </p>
            </div>

            {/* Colors */}
            <div>
              <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Available Colors (Separate with comma)
              </label>
              <input
                type="text"
                name="colors"
                value={formData.colors}
                onChange={handleChange}
                className="input-field"
                placeholder="Black, White, Blue, Red"
              />
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Use comma to separate each color
              </p>
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Price (Rs.) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="3500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category *
                </label>
                <select name="category" value={formData.category} onChange={handleChange} className="input-field" required>
                  <option value="">Select Category</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Brand & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ronin, Zero etc."
                />
              </div>
              <div>
                <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="10"
                  min="0"
                />
              </div>
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