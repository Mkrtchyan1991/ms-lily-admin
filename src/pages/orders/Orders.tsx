import { useCallback, useEffect, useState } from 'react';
import { ordersApi } from '@/service/orders/orders.api';
import { Order } from '@/service/service.types';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Input, Row, Select, Statistic, Table, Typography } from 'antd';

import styles from './orders.module.scss';

import { OrderDetailsModal } from './components/order-details-modal/OrderDetailsModal';
import { OrderEditModal } from './components/order-edit-modal/OrderEditModal';
import { createOrdersColumns } from './orders.utils';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export const Orders = () => {
  const { message } = App.useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [ordersSummary, setOrdersSummary] = useState({
    total_orders: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    total_revenue: '0',
  });

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ordersApi.admin.getAllOrders();

      if (response.data) {
        setOrders(response.data.data);
        setPagination((prev) => ({ ...prev, total: response.data.summary.total_orders }));
        setOrdersSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setIsEditModalOpen(true);
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  const handleStatusChange = async (id: number, status: Order['status']) => {
    try {
      await ordersApi.admin.updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
      message.success('Order status updated');
    } catch (error) {
      console.error('Failed to update order status:', error);
      message.error('Failed to update order status');
    }
  };

  // Calculate statistics
  const stats = {
    total: ordersSummary.total_orders,
    pending: ordersSummary.pending,
    processing: ordersSummary.processing,
    shipped: ordersSummary.shipped,
    delivered: ordersSummary.delivered,
    totalRevenue: ordersSummary.total_revenue,
  };

  // Create columns with handler functions
  const ordersColumns = createOrdersColumns({ handleView, handleStatusChange, handleEdit });

  return (
    <div className={styles.container}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={4}>
          <Card>
            <Statistic title="Total Orders" value={stats.total} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Pending" value={stats.pending} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Processing" value={stats.processing} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Shipped" value={stats.shipped} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Delivered" value={stats.delivered} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                Orders Management
              </Title>
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                Refresh
              </Button>
            </Col>
          </Row>

          {/* Filters */}
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search by order ID, customer name, phone, or product..."
                allowClear
                enterButton={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Filter by status"
                allowClear
                style={{ width: '100%' }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="pending">Pending</Option>
                <Option value="processing">Processing</Option>
                <Option value="shipped">Shipped</Option>
                <Option value="delivered">Delivered</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* Orders Table */}
        <Table
          columns={ordersColumns}
          dataSource={orders}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Order Details Modal */}
      <OrderDetailsModal
        open={isDetailsModalOpen}
        order={selectedOrder}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
      />
      <OrderEditModal
        open={isEditModalOpen}
        order={editingOrder}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingOrder(null);
        }}
        onUpdated={(updated) => {
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          if (selectedOrder && selectedOrder.id === updated.id) {
            setSelectedOrder(updated);
          }
        }}
      />
    </div>
  );
};
