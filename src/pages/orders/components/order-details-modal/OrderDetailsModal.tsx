import React from 'react';
import { Order } from '@/service/service.types';
import { CheckCircleOutlined, ClockCircleOutlined, ShoppingCartOutlined, TruckOutlined } from '@ant-design/icons';
import { Badge, Card, Col, Descriptions, Divider, Modal, Row, Steps, Table, Tag, Typography } from 'antd';

const { Title, Text } = Typography;

interface OrderDetailsModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'orange';
    case 'processing':
      return 'blue';
    case 'shipped':
      return 'purple';
    case 'delivered':
      return 'green';
    case 'cancelled':
      return 'red';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return <ClockCircleOutlined />;
    case 'processing':
      return <ShoppingCartOutlined />;
    case 'shipped':
      return <TruckOutlined />;
    case 'delivered':
      return <CheckCircleOutlined />;
    case 'cancelled':
      return <ClockCircleOutlined />;
    default:
      return <ClockCircleOutlined />;
  }
};

const getStepStatus = (currentStatus: Order['status'], stepStatus: string) => {
  const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const stepIndex = statusOrder.indexOf(stepStatus);

  if (currentStatus === 'cancelled') return 'error';
  if (stepIndex < currentIndex) return 'finish';
  if (stepIndex === currentIndex) return 'process';
  return 'wait';
};

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ open, order, onClose }) => {
  if (!order) return null;

  const itemsColumns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: string) => `$${price}`,
    },
    {
      title: 'Total',
      key: 'total',
      width: 120,
      render: (_: any, item: any) => `$${(parseFloat(item.price) * item.quantity).toFixed(2)}`,
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Title level={4} style={{ margin: 0 }}>
            Order #{order.id}
          </Title>
          <Tag color={getStatusColor(order.status)} icon={getStatusIcon(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Tag>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Row gutter={24}>
        <Col span={24}>
          <Card size="small" title="Order Status" style={{ marginBottom: '16px' }}>
            <Steps
              current={0}
              status={order.status === 'cancelled' ? 'error' : 'process'}
              items={[
                {
                  title: 'Pending',
                  status: getStepStatus(order.status, 'pending'),
                  icon: <ClockCircleOutlined />,
                },
                {
                  title: 'Processing',
                  status: getStepStatus(order.status, 'processing'),
                  icon: <ShoppingCartOutlined />,
                },
                {
                  title: 'Shipped',
                  status: getStepStatus(order.status, 'shipped'),
                  icon: <TruckOutlined />,
                },
                {
                  title: 'Delivered',
                  status: getStepStatus(order.status, 'delivered'),
                  icon: <CheckCircleOutlined />,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Card size="small" title="Order Information" style={{ marginBottom: '16px' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Order ID">#{order.id}</Descriptions.Item>
              <Descriptions.Item label="Date">
                {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <Text strong style={{ fontSize: '16px' }}>
                  ${order.total}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={12}>
          <Card size="small" title="Shipping Address" style={{ marginBottom: '16px' }}>
            <div>
              <Text strong>{order.shipping_address.full_name}</Text>
              <br />
              <Text>{order.shipping_address.phone}</Text>
              <br />
              <Text>{order.shipping_address.address_line1}</Text>
              <br />
              {order.shipping_address.address_line2 && (
                <>
                  <Text>{order.shipping_address.address_line2}</Text>
                  <br />
                </>
              )}
              <Text>
                {order.shipping_address.city}, {order.shipping_address.state}
              </Text>
              <br />
              <Text>
                {order.shipping_address.postal_code}, {order.shipping_address.country}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Card size="small" title="Order Items">
        <Table
          columns={itemsColumns}
          dataSource={order.items}
          pagination={false}
          rowKey="product_id"
          size="small"
          summary={(pageData) => {
            const total = pageData.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <Text strong>Total</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong>${total.toFixed(2)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </Modal>
  );
};
