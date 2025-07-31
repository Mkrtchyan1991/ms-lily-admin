import React, { useEffect } from 'react';
import { LoginRequest } from '@/service/service.types';
import { selectAuthError, selectIsAuthenticated } from '@/store/auth/auth.selectors';
import { clearError, loginUser } from '@/store/auth/auth.slice';
import { AppDispatch } from '@/store/store';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Input, Typography } from 'antd';

import styles from './login.module.scss';

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const { message } = App.useApp();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const error = useSelector(selectAuthError);

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    // Clear any previous errors when component mounts
    if (error) dispatch(clearError());
  }, [dispatch, error]);

  useEffect(() => {
    // Show error message if login fails
    if (error) message.error(error);
  }, [error]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(loginUser(data as LoginRequest));
      if (loginUser.fulfilled.match(result)) {
        message.success('Login successful!');
        reset(); // Clear form on success
        // Navigation will happen automatically due to isAuthenticated change
      }
    } catch (error) {
      // Error handling is done in the slice
      console.error('Login error:', error);
    }
  };

  const validateEmail = (value: string) => {
    if (!value) return 'Please input your email!';
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(value)) return 'Please enter a valid email!';
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Please input your password!';
    if (value.length < 6) return 'Password must be at least 6 characters!';
    return true;
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <Card className={styles.card}>
          <div className={styles.header}>
            <Title level={2} className={styles.title}>
              Welcome Back
            </Title>
            <Text type="secondary" className={styles.subtitle}>
              Sign in to your account
            </Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 24 }}
              onClose={() => dispatch(clearError())}
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email</label>
              <Controller
                name="email"
                control={control}
                rules={{ validate: validateEmail }}
                render={({ field }) => (
                  <Input
                    {...field}
                    prefix={<UserOutlined />}
                    placeholder="Enter your email"
                    size="large"
                    status={errors.email ? 'error' : ''}
                  />
                )}
              />
              {errors.email && (
                <div style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '4px' }}>{errors.email.message}</div>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Password</label>
              <Controller
                name="password"
                control={control}
                rules={{ validate: validatePassword }}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    prefix={<LockOutlined />}
                    placeholder="Enter your password"
                    size="large"
                    status={errors.password ? 'error' : ''}
                  />
                )}
              />
              {errors.password && (
                <div style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '4px' }}>{errors.password.message}</div>
              )}
            </div>

            <div className={styles.submitButton}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                size="large"
                block
                disabled={Object.keys(errors).length > 0}
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className={styles.footer}>
            <Text type="secondary">
              Don't have an account? <a href="/register">Sign up</a>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};
