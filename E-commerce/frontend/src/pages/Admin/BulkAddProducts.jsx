import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../../features/category/categorySlice.js';
import { adminBulkCreateProducts, clearAdminStates } from '../../features/admin/adminSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { toast } from 'react-toastify';
import {
  FiChevronLeft,
  FiPlus,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiLayers,
  FiCheckCircle,
} from 'react-icons/fi';

const createEmptyRow = (id) => ({
  id: id || Date.now() + Math.random(),
  title: '',
  brand: '',
  category: '',
  price: '',
  discountPrice: '',
  stock: '10',
  sku: '',
  imageUrl: '',
  description: '',
});

const BulkAddProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories } = useSelector((state) => state.category);
  const { loading, success, error } = useSelector((state) => state.admin);

  // Initialize with 3 empty product rows
  const [rows, setRows] = useState([
    createEmptyRow(1),
    createEmptyRow(2),
    createEmptyRow(3),
  ]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('All bulk products created successfully!');
      dispatch(clearAdminStates());
      navigate('/admin/products');
    }
  }, [success, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminStates());
    }
  }, [error, dispatch]);

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addSingleRow = () => {
    setRows([...rows, createEmptyRow()]);
  };

  const addMultipleRows = (count = 5) => {
    const newRows = Array.from({ length: count }, () => createEmptyRow());
    setRows([...rows, ...newRows]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) {
      toast.warning('At least one product row is required.');
      return;
    }
    setRows(rows.filter((_, i) => i !== index));
  };

  // Download Sample CSV Template
  const downloadCSVTemplate = () => {
    const csvContent =
      'title,brand,category,price,discountPrice,stock,sku,imageUrl,description\n' +
      '"OLED Ultra HD Smart TV 55 Inch",Sony,Televisions,89900,79900,15,SNY-TV-55,https://images.unsplash.com/photo-1593305841991-05c297ba4575,"Flagship OLED TV with 4K Quantum display."\n' +
      '"Wireless Noise Cancelling Headphones",Bose,Audio,24900,21900,30,BSE-HP-01,https://images.unsplash.com/photo-1505740420928-5e560c06d30e,"High acoustics studio sound quality."\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bulk_products_template.csv';
    link.click();
    toast.info('Sample CSV template downloaded!');
  };

  // Robust CSV parser supporting quotes, commas, escaped quotes and CRLF
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) return [];

    const parseLine = (line) => {
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    };

    const headers = parseLine(lines[0]).map((h) => h.replace(/^"|"$/g, '').trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.every((v) => !v)) continue;
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] !== undefined ? values[idx] : '';
      });
      data.push(row);
    }
    return data;
  };

  // Helper to extract property values flexibly across casing and column variations
  const extractItemVal = (item, ...keys) => {
    if (!item || typeof item !== 'object') return '';
    for (const k of keys) {
      for (const itemKey of Object.keys(item)) {
        const normKey = itemKey.toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normKey === targetNorm && item[itemKey] !== undefined && item[itemKey] !== null) {
          const val = item[itemKey];
          if (typeof val === 'string' || typeof val === 'number') {
            return String(val).trim();
          }
        }
      }
    }
    return '';
  };

  // Dedicated image URL extractor for JSON & CSV supporting strings, arrays, objects, and nested keys
  const extractImageUrl = (item) => {
    if (!item || typeof item !== 'object') return '';

    const imageKeys = [
      'imageUrl', 'image_url', 'image', 'images', 'thumbnail', 'thumb',
      'photo', 'photos', 'picture', 'pictures', 'img', 'imgs', 'src', 'pic', 'photo_url', 'logourl', 'logo'
    ];

    for (const k of imageKeys) {
      for (const ik of Object.keys(item)) {
        if (ik.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, '')) {
          const val = item[ik];
          if (!val) continue;

          // Single string URL
          if (typeof val === 'string' && val.trim()) {
            return val.trim();
          }

          // Array of URLs or objects
          if (Array.isArray(val) && val.length > 0) {
            const first = val[0];
            if (typeof first === 'string' && first.trim()) {
              return first.trim();
            }
            if (typeof first === 'object' && first !== null) {
              const nestedUrl = first.url || first.src || first.path || first.href || first.link || '';
              if (nestedUrl) return String(nestedUrl).trim();
            }
          }

          // Object with url or src
          if (typeof val === 'object' && val !== null) {
            const nestedUrl = val.url || val.src || val.path || val.href || val.link || '';
            if (nestedUrl) return String(nestedUrl).trim();
          }
        }
      }
    }

    // Fallback: search any string value starting with http:// or https://
    for (const ik of Object.keys(item)) {
      const val = item[ik];
      if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))) {
        return val.trim();
      }
    }

    return '';
  };

  const resolveCategoryId = (categoryInput) => {
    if (!categoryInput) return '';
    const cleanInput = String(categoryInput).trim();
    if (categories && categories.length > 0) {
      const match = categories.find(
        (c) =>
          c._id === cleanInput ||
          c.name.toLowerCase() === cleanInput.toLowerCase() ||
          c.slug.toLowerCase() === cleanInput.toLowerCase()
      );
      if (match) return match._id;
    }
    return cleanInput;
  };

  // Upload & Parse CSV/JSON file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        let imported = [];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            imported = parsed;
          } else if (parsed && typeof parsed === 'object') {
            // Find array inside root object (e.g. { "products": [...] }, { "items": [...] })
            const possibleArr = Object.values(parsed).find((val) => Array.isArray(val));
            if (possibleArr) {
              imported = possibleArr;
            }
          }
        } else {
          imported = parseCSV(text);
        }

        if (Array.isArray(imported) && imported.length > 0) {
          const parsedRows = imported.map((item, idx) => {
            const rawCat = extractItemVal(item, 'category', 'categoryname', 'cat');
            return {
              id: Date.now() + idx,
              title: extractItemVal(item, 'title', 'producttitle', 'name', 'productname'),
              brand: extractItemVal(item, 'brand', 'brandname', 'manufacturer'),
              category: resolveCategoryId(rawCat),
              price: extractItemVal(item, 'price', 'regularprice', 'cost'),
              discountPrice: extractItemVal(item, 'discountprice', 'discount', 'saleprice', 'offerprice'),
              stock: extractItemVal(item, 'stock', 'quantity', 'qty', 'inventory') || '10',
              sku: extractItemVal(item, 'sku', 'code', 'productcode'),
              imageUrl: extractImageUrl(item),
              description: extractItemVal(item, 'description', 'desc', 'details', 'summary'),
            };
          });

          setRows(parsedRows);
          toast.success(`Successfully loaded ${parsedRows.length} products from JSON/CSV file!`);
        } else {
          toast.error('Invalid file format or empty data rows. Please check your CSV/JSON file.');
        }
      } catch (err) {
        toast.error('Failed to parse uploaded file: ' + err.message);
      }
      e.target.value = ''; // Reset file input
    };
    reader.readAsText(file);
  };

  // Batch Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const validProducts = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const hasTitle = r.title && r.title.trim();
      const hasBrand = r.brand && r.brand.trim();
      const hasPrice = r.price !== '' && r.price !== null && r.price !== undefined;

      // Skip completely empty draft rows
      if (!hasTitle && !hasBrand && !hasPrice) {
        continue;
      }

      if (!hasTitle || !hasBrand || !hasPrice) {
        toast.error(`Row ${i + 1} has incomplete data. Please provide Title, Brand, and Price.`);
        return;
      }

      const numPrice = Number(r.price);
      if (isNaN(numPrice) || numPrice < 0) {
        toast.error(`Row ${i + 1} ("${r.title}") has an invalid price.`);
        return;
      }

      if (r.discountPrice && Number(r.discountPrice) > numPrice) {
        toast.error(`Row ${i + 1} ("${r.title}"): Discount price cannot be greater than regular price.`);
        return;
      }

      validProducts.push({
        title: r.title.trim(),
        brand: r.brand.trim(),
        category: r.category,
        price: numPrice,
        discountPrice: r.discountPrice ? Number(r.discountPrice) : 0,
        stock: r.stock !== '' ? Number(r.stock) : 10,
        sku: r.sku ? r.sku.trim() : '',
        imageUrl: r.imageUrl ? r.imageUrl.trim() : '',
        description: r.description ? r.description.trim() : '',
      });
    }

    if (validProducts.length === 0) {
      toast.error('Please fill out at least one product row with Title, Brand, and Price.');
      return;
    }

    dispatch(adminBulkCreateProducts(validProducts));
  };

  if (loading) {
    return <Loader />;
  }

  const validRowsCount = rows.filter(
    (r) => r.title && r.title.trim() && r.brand && r.brand.trim() && r.price !== ''
  ).length;

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-4">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center mb-1 cursor-pointer"
          >
            <FiChevronLeft className="mr-1" /> Back to Products Catalog
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <FiLayers className="text-blue-600" />
            <span>Bulk Add Multiple Products</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Add multiple products at once using interactive form rows or CSV/JSON file import
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={downloadCSVTemplate}
            className="inline-flex items-center px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <FiDownload className="mr-1.5" size={14} />
            <span>Sample CSV</span>
          </button>

          <label className="inline-flex items-center px-3.5 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition cursor-pointer">
            <FiUpload className="mr-1.5" size={14} />
            <span>Import CSV/JSON</span>
            <input
              type="file"
              accept=".csv, .json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Dynamic Product Rows Container */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Product List ({rows.length} Rows)
            </h2>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={addSingleRow}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition inline-flex items-center cursor-pointer"
              >
                <FiPlus className="mr-1" size={14} /> Row
              </button>
              <button
                type="button"
                onClick={() => addMultipleRows(5)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center cursor-pointer"
              >
                <FiPlus className="mr-1" size={14} /> 5 Rows
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="p-2.5 w-10 text-center">#</th>
                  <th className="p-2.5 min-w-[180px]">Product Title *</th>
                  <th className="p-2.5 min-w-[120px]">Brand *</th>
                  <th className="p-2.5 min-w-[140px]">Category</th>
                  <th className="p-2.5 w-24">Price (₹) *</th>
                  <th className="p-2.5 w-24">Discount (₹)</th>
                  <th className="p-2.5 w-20">Stock</th>
                  <th className="p-2.5 min-w-[160px]">Image URL</th>
                  <th className="p-2.5 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-2.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                    
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Product title"
                        value={row.title}
                        onChange={(e) => handleRowChange(idx, 'title', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-bold text-slate-900 bg-slate-50/50"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Brand name"
                        value={row.brand}
                        onChange={(e) => handleRowChange(idx, 'brand', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-semibold bg-slate-50/50"
                      />
                    </td>

                    <td className="p-2">
                      <select
                        value={row.category}
                        onChange={(e) => handleRowChange(idx, 'category', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-semibold bg-white"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        placeholder="999"
                        value={row.price}
                        onChange={(e) => handleRowChange(idx, 'price', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-bold text-slate-900 bg-slate-50/50"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        placeholder="Optional"
                        value={row.discountPrice}
                        onChange={(e) => handleRowChange(idx, 'discountPrice', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-medium bg-slate-50/50"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="number"
                        placeholder="10"
                        value={row.stock}
                        onChange={(e) => handleRowChange(idx, 'stock', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-medium bg-slate-50/50"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="https://..."
                        value={row.imageUrl}
                        onChange={(e) => handleRowChange(idx, 'imageUrl', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-medium bg-slate-50/50"
                      />
                    </td>

                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="Remove product row"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 text-white rounded-3xl p-6 shadow-lg border border-slate-800">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
              <FiCheckCircle className="text-emerald-400" size={16} />
              <span>Ready for Batch Import</span>
            </h3>
            <p className="text-xs text-slate-300">
              Valid rows will be processed and published into the store catalog immediately.
            </p>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-full shadow-lg shadow-blue-600/30 transition cursor-pointer whitespace-nowrap"
          >
            Create All Products ({validRowsCount}) →
          </button>
        </div>

      </form>

    </div>
  );
};

export default BulkAddProducts;
