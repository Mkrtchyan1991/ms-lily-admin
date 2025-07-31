import { Order } from '@/service/service.types';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import { Badge, Button, Space, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';

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

interface OrdersColumnsProps {
  handleView: (order: Order) => void;
}

export const createOrdersColumns = ({ handleView }: OrdersColumnsProps): ColumnsType<Order> => [
  {
    title: 'Order ID',
    dataIndex: 'id',
    key: 'id',
    width: 100,
    render: (id: number) => <span style={{ fontWeight: 500 }}>#{id}</span>,
  },
  {
    title: 'Customer',
    key: 'customer',
    render: (_, record: Order) => (
      <div>
        <div style={{ fontWeight: 500 }}>{record.shipping_address.full_name}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{record.shipping_address.phone}</div>
      </div>
    ),
  },
  {
    title: 'Items',
    key: 'items',
    render: (_, record: Order) => (
      <div>
        <div style={{ fontWeight: 500 }}>{record.items.length} item(s)</div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {record.items.slice(0, 2).map((item, index) => (
            <div key={index}>
              {item.product_name} (x{item.quantity})
            </div>
          ))}
          {record.items.length > 2 && <div style={{ color: '#1890ff' }}>+{record.items.length - 2} more</div>}
        </div>
      </div>
    ),
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    width: 120,
    sorter: (a, b) => parseFloat(a.total) - parseFloat(b.total),
    render: (total: string) => <span style={{ fontWeight: 500, fontSize: '16px' }}>${total}</span>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    filters: [
      { text: 'Pending', value: 'pending' },
      { text: 'Processing', value: 'processing' },
      { text: 'Shipped', value: 'shipped' },
      { text: 'Delivered', value: 'delivered' },
      { text: 'Cancelled', value: 'cancelled' },
    ],
    onFilter: (value, record) => record.status === value,
    render: (status: Order['status']) => (
      <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    ),
  },
  {
    title: 'Shipping Address',
    key: 'address',
    render: (_, record: Order) => (
      <div style={{ fontSize: '12px' }}>
        <div>{record.shipping_address.address_line1}</div>
        {record.shipping_address.address_line2 && <div>{record.shipping_address.address_line2}</div>}
        <div>
          {record.shipping_address.city}, {record.shipping_address.state}
        </div>
        <div>
          {record.shipping_address.postal_code}, {record.shipping_address.country}
        </div>
      </div>
    ),
  },
  {
    title: 'Date',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 120,
    sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    render: (date: string) => (
      <div>
        <div>{new Date(date).toLocaleDateString()}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{new Date(date).toLocaleTimeString()}</div>
      </div>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    render: (_, record: Order) => (
      <Space size="small">
        <Tooltip title="View Details">
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
        </Tooltip>
      </Space>
    ),
  },
];
