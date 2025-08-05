import React, { useEffect } from 'react';
import { ordersApi } from '@/service/orders/orders.api';
import { Order } from '@/service/service.types';
import { Controller, useForm } from 'react-hook-form';
import { SaveOutlined } from '@ant-design/icons';
import { App, Button, Col, Form, Input, Modal, Row } from 'antd';

interface OrderEditForm {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface OrderEditModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onUpdated: (order: Order) => void;
}

export const OrderEditModal: React.FC<OrderEditModalProps> = ({ open, order, onClose, onUpdated }) => {
  const { message } = App.useApp();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<OrderEditForm>({
    defaultValues: {
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    },
  });

  useEffect(() => {
    if (order && open) {
      const addr = order.shipping_address;
      reset({
        full_name: addr.full_name,
        phone: addr.phone,
        address_line1: addr.address_line1,
        address_line2: addr.address_line2 || '',
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        country: addr.country,
      });
    }
  }, [order, open, reset]);

  const onSubmit = async (data: OrderEditForm) => {
    if (!order) return;
    try {
      const res = await ordersApi.admin.updateOrder(order.id, {
        shipping_address: {
          full_name: data.full_name,
          phone: data.phone,
          address_line1: data.address_line1,
          address_line2: data.address_line2,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country,
        },
      });
      const updated = res.data.data;
      onUpdated(updated);
      message.success('Order updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to update order:', error);
      message.error('Failed to update order');
    }
  };

  return (
    <Modal
      title={order ? `Edit Order #${order.id}` : 'Edit Order'}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Full Name">
              <Controller name="full_name" control={control} render={({ field }) => <Input {...field} />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Phone">
              <Controller name="phone" control={control} render={({ field }) => <Input {...field} />} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Address Line 1">
          <Controller name="address_line1" control={control} render={({ field }) => <Input {...field} />} />
        </Form.Item>
        <Form.Item label="Address Line 2">
          <Controller name="address_line2" control={control} render={({ field }) => <Input {...field} />} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="City">
              <Controller name="city" control={control} render={({ field }) => <Input {...field} />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="State">
              <Controller name="state" control={control} render={({ field }) => <Input {...field} />} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Postal Code">
              <Controller name="postal_code" control={control} render={({ field }) => <Input {...field} />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Country">
              <Controller name="country" control={control} render={({ field }) => <Input {...field} />} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={onClose}>Cancel</Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isSubmitting}>
                Save
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrderEditModal;
