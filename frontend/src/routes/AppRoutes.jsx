import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from '../components/common/Loader.jsx';

// Layouts
import GuestLayout from '../layouts/GuestLayout.jsx';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';

// Lazy Loaded Guest Pages
const Home = lazy(() => import('../pages/Guest/Home.jsx'));
const Products = lazy(() => import('../pages/Guest/Products.jsx'));
const ProductDetails = lazy(() => import('../pages/Guest/ProductDetails.jsx'));
const Compare = lazy(() => import('../pages/Guest/Compare.jsx'));
const Login = lazy(() => import('../pages/Guest/Login.jsx'));
const Register = lazy(() => import('../pages/Guest/Register.jsx'));
const ForgotPassword = lazy(() => import('../pages/Guest/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('../pages/Guest/ResetPassword.jsx'));

// Lazy Loaded Customer Pages
const Profile = lazy(() => import('../pages/Customer/Profile.jsx'));
const Wishlist = lazy(() => import('../pages/Customer/Wishlist.jsx'));
const Cart = lazy(() => import('../pages/Customer/Cart.jsx'));
const Checkout = lazy(() => import('../pages/Customer/Checkout.jsx'));
const MyOrders = lazy(() => import('../pages/Customer/MyOrders.jsx'));
const OrderDetails = lazy(() => import('../pages/Customer/OrderDetails.jsx'));

// Lazy Loaded Admin Pages
const Dashboard = lazy(() => import('../pages/Admin/Dashboard.jsx'));
const AdminProducts = lazy(() => import('../pages/Admin/Products.jsx'));
const AddProduct = lazy(() => import('../pages/Admin/AddProduct.jsx'));
const BulkAddProducts = lazy(() => import('../pages/Admin/BulkAddProducts.jsx'));
const EditProduct = lazy(() => import('../pages/Admin/EditProduct.jsx'));
const Categories = lazy(() => import('../pages/Admin/Categories.jsx'));
const SubCategories = lazy(() => import('../pages/Admin/SubCategories.jsx'));
const Brands = lazy(() => import('../pages/Admin/Brands.jsx'));
const AdminOrders = lazy(() => import('../pages/Admin/Orders.jsx'));
const Users = lazy(() => import('../pages/Admin/Users.jsx'));
const Coupons = lazy(() => import('../pages/Admin/Coupons.jsx'));
const Banner = lazy(() => import('../pages/Admin/Banner.jsx'));

// Fallback Page
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        
        {/* Guest / Public Routes */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* Customer / User Protected Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders/my-orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/add" element={<AddProduct />} />
          <Route path="/admin/products/bulk-add" element={<BulkAddProducts />} />
          <Route path="/admin/products/edit/:slug" element={<EditProduct />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/subcategories" element={<SubCategories />} />
          <Route path="/admin/brands" element={<Brands />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/coupons" element={<Coupons />} />
          <Route path="/admin/banners" element={<Banner />} />
        </Route>

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
