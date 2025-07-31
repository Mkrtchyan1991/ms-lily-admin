import React, { useEffect } from 'react';
import { Loading } from '@/components/loading/Loading';
import { Header } from '@/layout/header/Header';
import { Sidebar } from '@/layout/sidebar/Sidebar';
import { DashboardPage } from '@/pages/dashboard/Dashboard.page';
import { LoginPage } from '@/pages/login/Login';
import { Orders } from '@/pages/orders/Orders';
import { Products } from '@/pages/products/Products';
import { ProfilePage } from '@/pages/profile/Profile';
import { Users } from '@/pages/users/Users';
import { selectAuthLoading, selectIsAuthenticated } from '@/store/auth/auth.selectors';
import { fetchUser } from '@/store/auth/auth.slice';
import { AppDispatch } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router';
import { Layout } from 'antd';

import styles from './app.module.scss';

const { Content } = Layout;

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  if (loading) return <Loading />;

  return (
    <Routes>
      {isAuthenticated ? (
        <Route
          path="*"
          element={
            <Layout className={styles.container}>
              <Header />
              <Layout>
                <Sidebar />
                <Layout className={styles.wrapper}>
                  <Content className={styles.main}>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      {/* Add more protected routes here */}
                    </Routes>
                  </Content>
                </Layout>
              </Layout>
            </Layout>
          }
        />
      ) : (
        <Route path="/login" element={<LoginPage />} />
      )}
      <Route path="*" element={<Navigate to={'/login'} />} />
    </Routes>
  );
};

export default App;
