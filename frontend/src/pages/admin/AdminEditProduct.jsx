import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getImageUrl } from '../../utils/imageHelper';
import LoadingPopup from '../../components/LoadingPopup';
import SuccessPopup from '../../components/SuccessPopup';
import toast from 'react-hot-toast';

const categories = [
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

const AdminEditProduct = () => {
  const { id } = useParams();
  const { admin } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#000000');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    specifications: '',
  });

  const [existingVariants, setExistingVariants] = useState([]);
  const [newVariantFiles, setNewVariantFiles] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`/api/products/${id}`);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        category: data.category || '',
        brand: data.brand || '',
        stock: data.stock?.toString() || '',
        specifications: data.specifications || '',
      });

      if (data.colorVariants && data.colorVariants.length > 0) {
        setExistingVariants(data.colorVariants.map(v => ({
          colorName: v.colorName,
          colorHex: v.colorHex || '#000000',
          images: v.images || [],
        })));
      } else if (data.images && data.images.length > 0) {
        setExistingVariants([{
          colorName: 'Default',
          colorHex: '#6b7280',
          images: data.images,
        }]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Product not found');
      navigate('/admin/manage-products');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addNewColorVariant = (colorName, colorHex) => {
    const inExisting = existingVariants.find(v => v.colorName === colorName);
    const inNew = newVariantFiles.find(v => v.colorName === colorName);

    if (inExisting) {
      toast.error(`${colorName} already exists. Upload more images to it directly.`);
      return;
    }
    if (inNew) {
      toast.error(`${colorName} already added`);
      return;
    }

    setNewVariantFiles(prev => [...prev, {
      colorName,
      colorHex,
      files: [],
      previews: [],
    }]);
    setShowColorPicker(false);
    toast.success(`${colorName} added! Upload images for it now.`);
  };

  const addCustomColor = () => {
    if (!customColorName.trim()) {
      toast.error('Enter color name');
      return;
    }
    addNewColorVariant(customColorName.trim(), customColorHex);
    setCustomColorName('');
    setCustomColorHex('#000000');
  };

  const removeExistingVariant = (index) => {
    if (!window.confirm('Remove this entire color variant with all its images?')) return;
    setExistingVariants(prev => prev.filter((_, i) => i !== index));

    // Also remove pending new images for this color
    const removedColor = existingVariants[index].colorName;
    setNewVariantFiles(prev => prev.filter(v => v.colorName !== removedColor));
  };

  const removeNewVariant = (index) => {
    setNewVariantFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (variantIndex, imageIndex) => {
    setExistingVariants(prev => {
      const updated = [...prev];
      updated[variantIndex] = {
        ...updated[variantIndex],
        images: updated[variantIndex].images.filter((_, i) => i !== imageIndex),
      };

      if (updated[variantIndex].images.length === 0) {
        if (window.confirm('This was the last image. Remove this color variant?')) {
          const removedColor = updated[variantIndex].colorName;
          const filtered = updated.filter((_, i) => i !== variantIndex);
          // Also clean pending new files for this color
          setNewVariantFiles(pv => pv.filter(v => v.colorName !== removedColor));
          return filtered;
        } else {
          return prev; // Cancel removal
        }
      }
      return updated;
    });
  };

  // ✅ FIXED: Add MORE images to existing color (NO DUPLICATES)
  const handleAddImagesToExisting = (variantIndex, event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB.`);
        event.target.value = '';
        return;
      }
    }

    const existingVariant = existingVariants[variantIndex];
    const existingNewIndex = newVariantFiles.findIndex(v => v.colorName === existingVariant.colorName);

    if (existingNewIndex !== -1) {
      // Update existing new variant - ADD FILES ONCE
      setNewVariantFiles(prev => {
        const arr = [...prev];
        arr[existingNewIndex] = {
          ...arr[existingNewIndex],
          files: [...arr[existingNewIndex].files, ...files],
        };
        return arr;
      });
    } else {
      // Create new entry with files
      setNewVariantFiles(prev => [
        ...prev,
        {
          colorName: existingVariant.colorName,
          colorHex: existingVariant.colorHex,
          files: [...files],
          previews: [],
        }
      ]);
    }

    // Generate previews SEPARATELY (only updates previews, not files)
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVariantFiles(prev => {
          const arr = [...prev];
          const idx = arr.findIndex(v => v.colorName === existingVariant.colorName);
          if (idx !== -1) {
            arr[idx] = {
              ...arr[idx],
              previews: [...arr[idx].previews, reader.result],
            };
          }
          return arr;
        });
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${files.length} image(s) added to ${existingVariant.colorName}`);

    // Reset input to allow re-uploading same file
    event.target.value = '';
  };

  // ✅ FIXED: Handle image upload for NEW color variants (NO DUPLICATES)
  const handleImageUploadForNew = (variantIndex, event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB.`);
        event.target.value = '';
        return;
      }
    }

    // Add files ONCE using functional setState
    setNewVariantFiles(prev => {
      const arr = [...prev];
      if (arr[variantIndex]) {
        arr[variantIndex] = {
          ...arr[variantIndex],
          files: [...arr[variantIndex].files, ...files],
        };
      }
      return arr;
    });

    // Generate previews SEPARATELY
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVariantFiles(prev => {
          const arr = [...prev];
          if (arr[variantIndex]) {
            arr[variantIndex] = {
              ...arr[variantIndex],
              previews: [...arr[variantIndex].previews, reader.result],
            };
          }
          return arr;
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = '';
  };

  const removeNewImage = (variantIndex, imageIndex) => {
    setNewVariantFiles(prev => {
      const updated = [...prev];
      updated[variantIndex] = {
        ...updated[variantIndex],
        files: updated[variantIndex].files.filter((_, i) => i !== imageIndex),
        previews: updated[variantIndex].previews.filter((_, i) => i !== imageIndex),
      };

      // Remove entire new variant if no files left
      if (updated[variantIndex].files.length === 0) {
        return updated.filter((_, i) => i !== variantIndex);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingVariants.length === 0 && newVariantFiles.length === 0) {
      toast.error('Please keep at least one color variant');
      return;
    }

    for (let variant of newVariantFiles) {
      const isForExisting = existingVariants.find(ev => ev.colorName === variant.colorName);
      if (!isForExisting && variant.files.length === 0) {
        toast.error(`Please upload images for ${variant.colorName}`);
        return;
      }
    }

    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('brand', formData.brand || '');
      data.append('stock', formData.stock || '10');
      data.append('specifications', formData.specifications || '');

      data.append('existingColorVariants', JSON.stringify(existingVariants));

      const allNewFiles = [];
      const newVariantsData = [];
      let currentIndex = 0;

      newVariantFiles.forEach((variant) => {
        const imageIndices = [];
        variant.files.forEach((file) => {
          allNewFiles.push(file);
          imageIndices.push(currentIndex);
          currentIndex++;
        });

        newVariantsData.push({
          colorName: variant.colorName,
          colorHex: variant.colorHex,
          imageIndices,
        });
      });

      allNewFiles.forEach((file) => {
        data.append('images', file);
      });

      data.append('colorVariants', JSON.stringify(newVariantsData));

      console.log('📤 Sending:', {
        existingVariants: existingVariants.length,
        newVariants: newVariantsData.length,
        newFiles: allNewFiles.length,
      });

      await axios.put(`/api/products/${id}`, data, {
        headers: {
          Authorization: `Bearer ${admin.token}`,
        },
      });

      setLoading(false);
      setShowSuccess(true);
    } catch (error) {
      setLoading(false);
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  };

  if (fetchLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      {loading && <LoadingPopup message="Updating Product..." subMessage="Saving changes and uploading images" />}
      {showSuccess && (
        <SuccessPopup
          message="Product Updated! ✨"
          subMessage="All changes have been saved successfully"
          buttonText="Back to Products"
          onClose={() => navigate('/admin/manage-products')}
        />
      )}

      <nav className={`border-b px-6 py-4 ${
        theme === 'dark' ? 'bg-[#0d0d1a] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black">
            <span className="gradient-text">EDIT PRODUCT</span>
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

            {/* EXISTING COLOR VARIANTS */}
            {existingVariants.length > 0 && (
              <div className={`p-6 rounded-2xl border-2 ${
                theme === 'dark' ? 'border-green-500/30 bg-green-500/5' : 'border-green-500/30 bg-green-50/50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      💾 Current Color Variants
                    </h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {existingVariants.length} color(s) saved
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {existingVariants.map((variant, variantIndex) => {
                    // Find pending new images for this color
                    const pendingNew = newVariantFiles.find(v => v.colorName === variant.colorName);

                    return (
                      <div key={`existing-${variantIndex}`} className={`p-4 rounded-xl ${
                        theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow border border-gray-100'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
                              style={{ background: variant.colorHex }}></div>
                            <div>
                              <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {variant.colorName}
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {variant.images.length} saved image(s)
                                {pendingNew && pendingNew.files.length > 0 && (
                                  <span className="text-green-500 ml-2">+ {pendingNew.files.length} new</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingVariant(variantIndex)}
                            className="text-red-500 hover:text-red-600 text-sm font-bold"
                          >
                            Remove Color
                          </button>
                        </div>

                        {variant.images.length > 0 && (
                          <div className="grid grid-cols-4 md:grid-cols-5 gap-2 mb-3">
                            {variant.images.map((img, imgIndex) => (
                              <div key={imgIndex} className="relative aspect-square rounded-lg overflow-hidden group">
                                <img
                                  src={getImageUrl(img)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=200'; }}
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => removeExistingImage(variantIndex, imgIndex)}
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

                        <label className={`block border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all hover:border-primary ${
                          theme === 'dark' ? 'border-gray-700 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            📸 Add more images for {variant.colorName}
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleAddImagesToExisting(variantIndex, e)}
                            className="hidden"
                          />
                        </label>

                        {/* Show pending new images */}
                        {pendingNew && pendingNew.previews.length > 0 && (
                          <div className="mt-3">
                            <p className={`text-xs font-bold mb-2 text-green-500`}>
                              🆕 New images to be uploaded ({pendingNew.previews.length}):
                            </p>
                            <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                              {pendingNew.previews.map((preview, pIdx) => {
                                const newVarIdx = newVariantFiles.findIndex(v => v.colorName === variant.colorName);
                                return (
                                  <div key={pIdx} className="relative aspect-square rounded-lg overflow-hidden group animate-scaleIn">
                                    <img src={preview} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <button
                                        type="button"
                                        onClick={() => removeNewImage(newVarIdx, pIdx)}
                                        className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                                      >✕</button>
                                    </div>
                                    <span className="absolute top-1 left-1 bg-green-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                                      NEW
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ADD NEW COLOR VARIANT */}
            <div className={`p-6 rounded-2xl border-2 border-dashed ${
              theme === 'dark' ? 'border-primary/30 bg-[#0a0a1a]' : 'border-primary/30 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    🎨 Add New Color Variants
                  </h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Add completely new colors with their own images
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

              {showColorPicker && (
                <div className={`p-4 rounded-xl mb-4 ${
                  theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow border border-gray-200'
                }`}>
                  <p className={`text-sm font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Choose a Color:
                  </p>

                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                    {commonColors.map((color) => {
                      const isUsed = existingVariants.find(v => v.colorName === color.name)
                        || newVariantFiles.find(v => v.colorName === color.name && !existingVariants.find(ev => ev.colorName === color.name));

                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => !isUsed && addNewColorVariant(color.name, color.hex)}
                          disabled={isUsed}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            isUsed ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'
                          } ${
                            theme === 'dark' ? 'border-gray-700 hover:border-primary' : 'border-gray-200 hover:border-primary'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full mx-auto mb-1 border-2 border-white shadow"
                            style={{ background: color.hex }}></div>
                          <p className={`text-[10px] text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {color.name}
                          </p>
                          {isUsed && <p className="text-[8px] text-red-400 mt-1">Used</p>}
                        </button>
                      );
                    })}
                  </div>

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

              {newVariantFiles.filter(nv => !existingVariants.find(ev => ev.colorName === nv.colorName)).length > 0 ? (
                <div className="space-y-4">
                  {newVariantFiles.map((variant, variantIndex) => {
                    if (existingVariants.find(ev => ev.colorName === variant.colorName)) {
                      return null;
                    }

                    return (
                      <div key={variantIndex} className={`p-4 rounded-xl ${
                        theme === 'dark' ? 'bg-[#12122a] border border-gray-800' : 'bg-white shadow border border-gray-100'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
                              style={{ background: variant.colorHex }}></div>
                            <div>
                              <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {variant.colorName}
                                <span className="ml-2 text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">NEW</span>
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {variant.files.length} image(s) selected
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNewVariant(variantIndex)}
                            className="text-red-500 hover:text-red-600 text-sm font-bold"
                          >
                            Remove
                          </button>
                        </div>

                        {variant.previews.length > 0 && (
                          <div className="grid grid-cols-4 md:grid-cols-5 gap-2 mb-3">
                            {variant.previews.map((preview, imgIndex) => (
                              <div key={imgIndex} className="relative aspect-square rounded-lg overflow-hidden group animate-scaleIn">
                                <img src={preview} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => removeNewImage(variantIndex, imgIndex)}
                                    className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                                  >✕</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <label className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all hover:border-primary ${
                          theme === 'dark' ? 'border-gray-700 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                          <p className="text-2xl mb-1">📸</p>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            Upload images for {variant.colorName}
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleImageUploadForNew(variantIndex, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Click "+ Add Color" above to add new color variants
                  </p>
                </div>
              )}
            </div>

            {/* Product Details */}
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
                Specifications (Separate with | )
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
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
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

            <button type="submit" disabled={loading} className="btn-primary w-full text-lg disabled:opacity-50">
              {loading ? 'Updating Product...' : 'Update Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditProduct;