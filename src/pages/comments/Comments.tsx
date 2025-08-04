import React, { useEffect, useState } from 'react';
import { commentsApi } from '@/service/comments/comments.api';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  App,
  Avatar,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Pagination,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import styles from './comments.module.scss';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

// Updated interface to match your API response
interface Comment {
  id: number;
  content: string;
  approved: number; // 0 = pending, 1 = approved
  user: {
    id: number;
    name: string;
    last_name: string;
    email: string;
    country?: string;
    city?: string;
    postal_code?: string;
    address?: string;
    email_verified_at?: string;
    is_verified: boolean;
    role: string;
    mobile_number: string;
  };
  product_id: number;
  created_at: string;
  updated_at?: string;
}

interface CommentsTableData extends Comment {
  key: string;
}

export const Comments: React.FC = () => {
  const { message } = App.useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'all'>('pending');

  const fetchComments = async (page = 1, perPage = 10, status?: 'pending' | 'approved') => {
    try {
      setLoading(true);
      let response;

      if (status === 'pending') {
        response = await commentsApi.admin.getPendingComments({
          page,
          per_page: perPage,
        });
      } else {
        // For approved or all comments, we'll use the general endpoint
        // You might need to update this based on your actual API
        response = await commentsApi.admin.getAllComments({
          page,
          per_page: perPage,
        });
      }

      if (response.data) {
        let commentsData = [];

        // Handle both array response (pending) and paginated response (all)
        if (Array.isArray(response.data)) {
          commentsData = response.data;
          setTotal(response.data.length);
          setCurrentPage(1);
        } else {
          commentsData = response.data.data;
          setTotal(response.data.total);
          setCurrentPage(response.data.current_page);
        }

        // Filter comments based on status
        if (status === 'approved') {
          commentsData = commentsData.filter((comment: Comment) => comment.approved === 1);
        } else if (status === 'pending') {
          commentsData = commentsData.filter((comment: Comment) => comment.approved === 0);
        }

        setComments(commentsData);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      message.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(currentPage, pageSize, statusFilter === 'all' ? undefined : statusFilter);
  }, [currentPage, pageSize, statusFilter]);

  const handleApprove = async (commentId: number) => {
    try {
      await commentsApi.admin.approveComment(commentId);
      message.success('Comment approved successfully');
      await fetchComments(currentPage, pageSize, statusFilter === 'all' ? undefined : statusFilter);
    } catch (error) {
      console.error('Failed to approve comment:', error);
      message.error('Failed to approve comment');
    }
  };

  const handleReject = async (commentId: number) => {
    try {
      await commentsApi.admin.rejectComment(commentId);
      message.success('Comment rejected successfully');
      await fetchComments(currentPage, pageSize, statusFilter === 'all' ? undefined : statusFilter);
    } catch (error) {
      console.error('Failed to reject comment:', error);
      message.error('Failed to reject comment');
    }
  };

  const handleDelete = (commentId: number) => {
    confirm({
      title: 'Delete Comment',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this comment? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await commentsApi.admin.deleteComment(commentId);
          message.success('Comment deleted successfully');
          await fetchComments(currentPage, pageSize, statusFilter === 'all' ? undefined : statusFilter);
        } catch (error) {
          console.error('Failed to delete comment:', error);
          message.error('Failed to delete comment');
        }
      },
    });
  };

  const handleView = (comment: Comment) => {
    setSelectedComment(comment);
    setDetailsModalOpen(true);
  };

  const handleRefresh = () => {
    fetchComments(currentPage, pageSize, statusFilter === 'all' ? undefined : statusFilter);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleStatusFilterChange = (value: 'pending' | 'approved' | 'all') => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePaginationChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  // Filter comments based on search text
  const filteredComments = comments.filter((comment) => {
    if (!searchText) return true;

    const searchLower = searchText.toLowerCase();
    return (
      comment.content.toLowerCase().includes(searchLower) ||
      comment.user.name.toLowerCase().includes(searchLower) ||
      comment.user.email.toLowerCase().includes(searchLower) ||
      comment.id.toString().includes(searchText)
    );
  });

  const getStatusColor = (approved: number) => {
    return approved === 1 ? 'success' : 'warning';
  };

  const getStatusText = (approved: number) => {
    return approved === 1 ? 'Approved' : 'Pending';
  };

  const columns: ColumnsType<CommentsTableData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'User',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div className={styles.userInfo}>
          <Avatar size="small" icon={<UserOutlined />}>
            {record.user.name.charAt(0).toUpperCase()}
          </Avatar>
          <div className={styles.details}>
            <Text className={styles.name}>
              {record.user.name} {record.user.last_name}
            </Text>
            <Text type="secondary" className={styles.email}>
              {record.user.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Comment',
      dataIndex: 'content',
      key: 'content',
      ellipsis: {
        showTitle: false,
      },
      render: (content: string) => (
        <Tooltip title={content}>
          <Text ellipsis style={{ maxWidth: 300 }}>
            {content}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Product ID',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'approved',
      key: 'approved',
      width: 120,
      render: (approved: number) => <Tag color={getStatusColor(approved)}>{getStatusText(approved)}</Tag>,
      filters: [
        { text: 'Pending', value: 0 },
        { text: 'Approved', value: 1 },
      ],
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => <Text type="secondary">{dayjs(date).format('MMM DD, YYYY')}</Text>,
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small" className={styles.actionButtons}>
          <Tooltip title="View Details">
            <Button type="primary" ghost size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>

          {record.approved === 0 && (
            <>
              <Tooltip title="Approve">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record.id)}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button danger size="small" icon={<CloseOutlined />} onClick={() => handleReject(record.id)} />
              </Tooltip>
            </>
          )}

          <Tooltip title="Delete">
            <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const tableData: CommentsTableData[] = filteredComments.map((comment) => ({
    ...comment,
    key: comment.id.toString(),
  }));

  return (
    <div className={styles.container}>
      {/* Header */}
      <Card className={styles.header}>
        <div className={styles.headerContent}>
          <Title level={2} className={styles.title}>
            Comments Management
          </Title>
          <div className={styles.actions}>
            <Button type="primary" ghost icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className={styles.filters}>
        <Space size="middle" wrap>
          <div className={styles.filterItem}>
            <Text strong>Status:</Text>
            <Select value={statusFilter} onChange={handleStatusFilterChange} style={{ width: 150, marginLeft: 8 }}>
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="all">All</Option>
            </Select>
          </div>

          <div className={styles.searchInput}>
            <Search
              placeholder="Search comments, users, or IDs..."
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && setSearchText('')}
              style={{ width: 350 }}
            />
          </div>
        </Space>
      </Card>

      {/* Table */}
      <Card className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>
            <Spin size="large" tip="Loading comments..." />
          </div>
        ) : filteredComments.length === 0 ? (
          <Empty className={styles.empty} description="No comments found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              className={styles.commentsTable}
              scroll={{ x: 1200 }}
            />

            <div className={styles.pagination}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={handlePaginationChange}
                onShowSizeChange={handlePaginationChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} comments`}
                pageSizeOptions={['10', '20', '50', '100']}
              />
            </div>
          </>
        )}
      </Card>

      {/* Comment Details Modal */}
      <Modal
        title="Comment Details"
        open={detailsModalOpen}
        onCancel={() => setDetailsModalOpen(false)}
        footer={
          selectedComment && (
            <Space>
              <Button onClick={() => setDetailsModalOpen(false)}>Close</Button>
              {selectedComment.approved === 0 && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => {
                      handleApprove(selectedComment.id);
                      setDetailsModalOpen(false);
                    }}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  >
                    Approve
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => {
                      handleReject(selectedComment.id);
                      setDetailsModalOpen(false);
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  handleDelete(selectedComment.id);
                  setDetailsModalOpen(false);
                }}
              >
                Delete
              </Button>
            </Space>
          )
        }
        width={600}
      >
        {selectedComment && (
          <div className={styles.commentDetails}>
            <div className={styles.detailRow}>
              <Text strong>Comment ID:</Text>
              <Text>{selectedComment.id}</Text>
            </div>

            <div className={styles.detailRow}>
              <Text strong>User:</Text>
              <div className={styles.userInfo}>
                <Avatar size="small" icon={<UserOutlined />}>
                  {selectedComment.user.name.charAt(0).toUpperCase()}
                </Avatar>
                <div className={styles.details}>
                  <Text>
                    {selectedComment.user.name} {selectedComment.user.last_name}
                  </Text>
                  <Text type="secondary">{selectedComment.user.email}</Text>
                </div>
              </div>
            </div>

            <div className={styles.detailRow}>
              <Text strong>Product ID:</Text>
              <Text>{selectedComment.product_id}</Text>
            </div>

            <div className={styles.detailRow}>
              <Text strong>Status:</Text>
              <Tag color={getStatusColor(selectedComment.approved)}>{getStatusText(selectedComment.approved)}</Tag>
            </div>

            <div className={styles.detailRow}>
              <Text strong>Created:</Text>
              <Text>{dayjs(selectedComment.created_at).format('MMMM DD, YYYY [at] HH:mm')}</Text>
            </div>

            <div className={styles.detailRow}>
              <Text strong>Updated:</Text>
              <Text>
                {selectedComment.updated_at
                  ? dayjs(selectedComment.updated_at).format('MMMM DD, YYYY [at] HH:mm')
                  : 'Not updated'}
              </Text>
            </div>

            <div className={styles.commentContent}>
              <Text strong>Comment:</Text>
              <Paragraph className={styles.content}>{selectedComment.content}</Paragraph>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
