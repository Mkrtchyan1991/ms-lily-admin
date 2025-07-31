import React from 'react';
import { authApi } from '@/service/auth/auth.api';
import { selectAuthUser } from '@/store/auth/auth.selectors';
import { setUser } from '@/store/auth/auth.slice';
import { AppDispatch } from '@/store/store';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { LockOutlined, MailOutlined, PhoneOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Form, Input, Row, Typography } from 'antd';

import styles from './profile.module.scss';

const { Title, Text } = Typography;

interface ProfileFormData {
  name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  country?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  password?: string;
  password_confirmation?: string;
}

export const ProfilePage: React.FC = () => {
  const { message } = App.useApp();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectAuthUser);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: currentUser?.name || '',
      last_name: currentUser?.last_name || '',
      email: currentUser?.email || '',
      mobile_number: currentUser?.mobile_number || '',
      country: currentUser?.country || '',
      address: currentUser?.address || '',
      city: currentUser?.city || '',
      postal_code: currentUser?.postal_code || '',
      password: '',
      password_confirmation: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Remove empty password fields if not updating password
      const updateData = { ...data };
      if (!data.password) {
        delete updateData.password;
        delete updateData.password_confirmation;
      }

      const response = await authApi.updateProfile(updateData);

      // Update user in Redux store
      dispatch(setUser(response.data));

      message.success('Profile updated successfully');

      // Clear password fields after successful update
      setValue('password', '');
      setValue('password_confirmation', '');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      message.error(errorMessage);
    }
  };

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(value)) return 'Please enter a valid email';
    return true;
  };

  const validatePhone = (value: string) => {
    if (!value) return 'Phone number is required';
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (!phoneRegex.test(value)) return 'Please enter a valid phone number';
    return true;
  };

  const validatePasswordConfirmation = (value: string | undefined) => {
    if (password && !value) return 'Please confirm your password';
    if (password && value && value !== password) return 'Passwords do not match';
    return true;
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Title level={2}>Profile Settings</Title>
          <Text type="secondary">Update your personal information and account settings</Text>
        </div>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className={styles.form}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="First Name"
                validateStatus={errors.name ? 'error' : ''}
                help={errors.name?.message}
                required
              >
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'First name is required' }}
                  render={({ field }) => (
                    <Input {...field} prefix={<UserOutlined />} placeholder="Enter your first name" size="large" />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Last Name"
                validateStatus={errors.last_name ? 'error' : ''}
                help={errors.last_name?.message}
                required
              >
                <Controller
                  name="last_name"
                  control={control}
                  rules={{ required: 'Last name is required' }}
                  render={({ field }) => (
                    <Input {...field} prefix={<UserOutlined />} placeholder="Enter your last name" size="large" />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="Email"
                validateStatus={errors.email ? 'error' : ''}
                help={errors.email?.message}
                required
              >
                <Controller
                  name="email"
                  control={control}
                  rules={{ validate: validateEmail }}
                  render={({ field }) => (
                    <Input {...field} prefix={<MailOutlined />} placeholder="Enter your email" size="large" />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Phone Number"
                validateStatus={errors.mobile_number ? 'error' : ''}
                help={errors.mobile_number?.message}
                required
              >
                <Controller
                  name="mobile_number"
                  control={control}
                  rules={{ validate: validatePhone }}
                  render={({ field }) => (
                    <Input {...field} prefix={<PhoneOutlined />} placeholder="Enter your phone number" size="large" />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Country" validateStatus={errors.country ? 'error' : ''} help={errors.country?.message}>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="Enter your country" size="large" />}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="City" validateStatus={errors.city ? 'error' : ''} help={errors.city?.message}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="Enter your city" size="large" />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Address" validateStatus={errors.address ? 'error' : ''} help={errors.address?.message}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="Enter your address" size="large" />}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Postal Code"
                validateStatus={errors.postal_code ? 'error' : ''}
                help={errors.postal_code?.message}
              >
                <Controller
                  name="postal_code"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="Enter your postal code" size="large" />}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className={styles.passwordSection}>
            <Title level={4}>Change Password</Title>
            <Text type="secondary">Leave empty if you don't want to change your password</Text>

            <Row gutter={24} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <Form.Item
                  label="New Password"
                  validateStatus={errors.password ? 'error' : ''}
                  help={errors.password?.message}
                >
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      validate: (value) => {
                        if (value && value.length < 6) {
                          return 'Password must be at least 6 characters';
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <Input.Password
                        {...field}
                        prefix={<LockOutlined />}
                        placeholder="Enter new password"
                        size="large"
                      />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Confirm Password"
                  validateStatus={errors.password_confirmation ? 'error' : ''}
                  help={errors.password_confirmation?.message}
                >
                  <Controller
                    name="password_confirmation"
                    control={control}
                    rules={{ validate: validatePasswordConfirmation }}
                    render={({ field }) => (
                      <Input.Password
                        {...field}
                        prefix={<LockOutlined />}
                        placeholder="Confirm new password"
                        size="large"
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Form.Item className={styles.submitButton}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              size="large"
              icon={<SaveOutlined />}
              className={styles.saveButton}
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
