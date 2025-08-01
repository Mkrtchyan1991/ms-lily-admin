import React, { useEffect } from 'react';
import { RegisterRequest, User } from '@/service/service.types';
import { catchErrorMessage } from '@/service/service.utils';
import { usersApi } from '@/service/users/users.api';
import { Controller, useForm } from 'react-hook-form';
import {
  GlobalOutlined,
  HomeOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { App, Button, Col, Form, Input, Modal, Row, Select } from 'antd';

const { Option } = Select;

interface UserFormData {
  name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  password?: string;
  password_confirmation?: string;
  role: 'admin' | 'user';
  country?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

interface UserEditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: User | null;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({ open, onClose, onSuccess, user }) => {
  const { message } = App.useApp();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    // watch,
  } = useForm<UserFormData>({
    defaultValues: {
      name: '',
      last_name: '',
      email: '',
      mobile_number: '',
      password: '',
      password_confirmation: '',
      role: 'user',
      country: '',
      address: '',
      city: '',
      postal_code: '',
    },
  });

  // const password = watch('password');

  // Reset form when user changes
  useEffect(() => {
    if (user && open) {
      reset({
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        mobile_number: user.mobile_number,
        role: user.role,
        country: user.country || '',
        address: user.address || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
        password: '',
        password_confirmation: '',
      });
    }
  }, [user, open, reset]);

  const onSubmit = async (data: UserFormData) => {
    if (!user) return;

    try {
      const updateData: Partial<RegisterRequest> = {
        name: data.name,
        last_name: data.last_name,
        email: data.email,
        mobile_number: data.mobile_number,
        role: data.role,
        country: data.country,
        address: data.address,
        city: data.city,
        postal_code: data.postal_code,
      };

      // Only include password if it's provided
      if (data.password) {
        updateData.password = data.password;
        updateData.password_confirmation = data.password_confirmation;
      }

      await usersApi.admin.updateUser(user.id, updateData);
      message.success('User updated successfully');
      onClose();
      onSuccess?.();
    } catch (error) {
      const errorMessage = catchErrorMessage(error) || 'Failed to update user';
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
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(value)) return 'Please enter a valid phone number';
    return true;
  };

  // const validatePassword = (value: string) => {
  //   if (value && value.length < 8) return 'Password must be at least 8 characters';
  //   return true;
  // };

  // const validatePasswordConfirmation = (value: string) => {
  //   if (password && !value) return 'Password confirmation is required';
  //   if (value && value !== password) return 'Passwords do not match';
  //   return true;
  // };

  return (
    <Modal title="Edit User" open={open} onCancel={onClose} footer={null} width={800} destroyOnClose>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row gutter={16}>
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
                render={({ field }) => <Input {...field} prefix={<UserOutlined />} placeholder="Enter first name" />}
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
                render={({ field }) => <Input {...field} prefix={<UserOutlined />} placeholder="Enter last name" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message} required>
              <Controller
                name="email"
                control={control}
                rules={{ validate: validateEmail }}
                render={({ field }) => (
                  <Input {...field} prefix={<MailOutlined />} placeholder="Enter email address" type="email" />
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
                render={({ field }) => <Input {...field} prefix={<PhoneOutlined />} placeholder="Enter phone number" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="New Password (optional)"
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password?.message}
            >
              <Controller
                name="password"
                control={control}
                //  rules={{ validate: validatePassword }}
                render={({ field }) => (
                  <Input.Password {...field} prefix={<LockOutlined />} placeholder="Enter new password" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Confirm New Password"
              validateStatus={errors.password_confirmation ? 'error' : ''}
              help={errors.password_confirmation?.message}
            >
              <Controller
                name="password_confirmation"
                control={control}
                //  rules={{ validate: validatePasswordConfirmation }}
                render={({ field }) => (
                  <Input.Password {...field} prefix={<LockOutlined />} placeholder="Confirm new password" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Role" validateStatus={errors.role ? 'error' : ''} help={errors.role?.message} required>
              <Controller
                name="role"
                control={control}
                rules={{ required: 'Role is required' }}
                render={({ field }) => (
                  <Select {...field} placeholder="Select role">
                    <Option value="user">User</Option>
                    <Option value="admin">Admin</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Country" validateStatus={errors.country ? 'error' : ''} help={errors.country?.message}>
              <Controller
                name="country"
                control={control}
                render={({ field }) => <Input {...field} prefix={<GlobalOutlined />} placeholder="Enter country" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="City" validateStatus={errors.city ? 'error' : ''} help={errors.city?.message}>
              <Controller
                name="city"
                control={control}
                render={({ field }) => <Input {...field} prefix={<HomeOutlined />} placeholder="Enter city" />}
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
                render={({ field }) => <Input {...field} placeholder="Enter postal code" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Address" validateStatus={errors.address ? 'error' : ''} help={errors.address?.message}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => <Input.TextArea {...field} rows={3} placeholder="Enter full address" />}
          />
        </Form.Item>

        <Form.Item>
          <Row gutter={16} justify="end">
            <Col>
              <Button onClick={onClose}>Cancel</Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" loading={isSubmitting} icon={<SaveOutlined />}>
                Update User
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  );
};
