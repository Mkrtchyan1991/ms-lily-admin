/* eslint-disable react-refresh/only-export-components */
import { ProductComment } from '@/service/service.types';
import { formatDate, formatDateTime, formatTime } from '@/utils/date';
import { Link } from 'react-router';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Select, Space, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';

const { Text } = Typography;
const { Option } = Select;

const getStatusColor = (status: ProductComment['status']) => {
  switch (status) {
    case 'pending':
      return 'orange';
    case 'approved':
      return 'green';
    case 'rejected':
      return 'red';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: ProductComment['status']) => {
  switch (status) {
    case 'pending':
      return <ClockCircleOutlined />;
    case 'approved':
      return <CheckCircleOutlined />;
    case 'rejected':
      return <CloseCircleOutlined />;
    default:
      return <ClockCircleOutlined />;
  }
};

const getStatusText = (status: ProductComment['status']) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// User info component for better reusability
const UserInfo: React.FC<{ user: ProductComment['user'] }> = ({ user }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <Avatar size="small" icon={<UserOutlined />}>
      {user.name.charAt(0).toUpperCase()}
    </Avatar>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <Text style={{ fontWeight: 500 }}>
        {user.name} {user.last_name}
      </Text>
      <Text type="secondary" style={{ fontSize: '12px' }}>
        {user.email}
      </Text>
    </div>
  </div>
);

interface CommentsColumnsProps {
  handleView: (comment: ProductComment) => void;
  handleEdit: (comment: ProductComment) => void;
  handleStatusChange: (id: number, status: ProductComment['status']) => void;
  handleDelete: (id: number) => void;
}

interface CommentsTableData extends ProductComment {
  key: string;
}

export const createCommentsColumns = ({
  handleView,
  handleEdit,
  handleStatusChange,
  handleDelete,
}: CommentsColumnsProps): ColumnsType<CommentsTableData> => [
  {
    title: 'Comment ID',
    dataIndex: 'id',
    key: 'id',
    width: 100,
    render: (id: number) => <span style={{ fontWeight: 500 }}>#{id}</span>,
  },
  {
    title: 'User',
    dataIndex: 'user',
    key: 'user',
    render: (user: ProductComment['user']) => <UserInfo user={user} />,
    width: 200,
  },
  {
    title: 'Product',
    dataIndex: 'product',
    key: 'product',
    render: (product: ProductComment['product']) => (
      <div>
        <Link style={{ fontWeight: 500 }} to={`/products/${product?.id}`}>
          {product?.name || 'N/A'}
        </Link>
        <div style={{ fontSize: '12px', color: '#666' }}>ID: {product?.id || 'N/A'}</div>
      </div>
    ),
    width: 180,
  },
  {
    title: 'Content',
    dataIndex: 'content',
    key: 'content',
    render: (content: string) => (
      <Text ellipsis={{ tooltip: content }} style={{ maxWidth: 300 }}>
        {content}
      </Text>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: ProductComment['status'], record: CommentsTableData) => (
      <Select
        value={status}
        style={{ width: 120 }}
        onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
        size="small"
      >
        <Option value="pending">
          <Space>
            <ClockCircleOutlined style={{ color: '#fa8c16' }} />
            Pending
          </Space>
        </Option>
        <Option value="approved">
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            Approved
          </Space>
        </Option>
        <Option value="rejected">
          <Space>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            Rejected
          </Space>
        </Option>
      </Select>
    ),
    width: 140,
  },
  {
    title: 'Date',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (date: string) => (
      <Tooltip title={formatDateTime(date, { dateStyle: 'medium', timeStyle: 'medium' })}>
        <div>
          <div style={{ fontWeight: 500 }}>{formatDate(date)}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{formatTime(date)}</div>
        </div>
      </Tooltip>
    ),
    width: 120,
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record: CommentsTableData) => (
      <Space size="small">
        <Tooltip title="View Details">
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} size="small" />
        </Tooltip>
        <Tooltip title="Edit">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
        </Tooltip>
        <Tooltip title="Delete">
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} size="small" />
        </Tooltip>
      </Space>
    ),
    width: 100,
    fixed: 'right',
  },
];

export { getStatusColor, getStatusIcon, getStatusText, UserInfo };
