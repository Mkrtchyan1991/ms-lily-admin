import React from 'react';
import { RegisterRequest } from '@/service/service.types';
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
  password: string;
  password_confirmation: string;
  role: 'admin' | 'user';
  country?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

interface UserCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UserCreateModal: React.FC<UserCreateModalProps> = ({ open, onClose, onSuccess }) => {
  const { message } = App.useApp();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
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

  const password = watch('password');

  const onSubmit = async (data: UserFormData) => {
    try {
      const createData: RegisterRequest = {
        name: data.name,
        last_name: data.last_name,
        email: data.email,
        mobile_number: data.mobile_number,
        password: data.password,
        password_confirmation: data.password_confirmation,
        role: data.role,
        country: data.country,
        address: data.address,
        city: data.city,
        postal_code: data.postal_code,
      };

      await usersApi.admin.createUser(createData);
      message.success('User created successfully');
      reset();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create user';
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

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return true;
  };

  const validatePasswordConfirmation = (value: string) => {
    if (!value) return 'Password confirmation is required';
    if (value !== password) return 'Passwords do not match';
    return true;
  };

  return (
    <Modal title="Create New User" open={open} onCancel={onClose} footer={null} width={800} destroyOnClose>
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
              label="Password"
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password?.message}
              required
            >
              <Controller
                name="password"
                control={control}
                rules={{ validate: validatePassword }}
                render={({ field }) => (
                  <Input.Password {...field} prefix={<LockOutlined />} placeholder="Enter password" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Confirm Password"
              validateStatus={errors.password_confirmation ? 'error' : ''}
              help={errors.password_confirmation?.message}
              required
            >
              <Controller
                name="password_confirmation"
                control={control}
                rules={{ validate: validatePasswordConfirmation }}
                render={({ field }) => (
                  <Input.Password {...field} prefix={<LockOutlined />} placeholder="Confirm password" />
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
                Create User
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  );
};
