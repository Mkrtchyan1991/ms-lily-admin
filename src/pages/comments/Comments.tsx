import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { commentsApi } from '@/service/comments/comments.api';
import { Comment } from '@/service/service.types';
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

interface CommentsTableData extends Comment {
  key: string;
}

type StatusFilter = Comment['status'] | 'all';

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');

  // Memoized fetch function to prevent unnecessary API calls
  const fetchComments = useCallback(
    async (page: number = currentPage, perPage: number = pageSize, status?: StatusFilter, search?: string) => {
      try {
        setLoading(true);

        const response = await commentsApi.admin.getAllComments({
          page,
          per_page: perPage,
          status: status === 'all' ? undefined : status,
          search,
          sort_by: 'created_at',
          sort_order: 'desc',
        });

        if (response.data) {
          setComments(response.data.data);
          setTotal(response.data.total);
          setCurrentPage(response.data.current_page);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        message.error('Failed to load comments');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, message],
  );

  // Effect for fetching comments (removed searchText from dependencies to prevent auto-fetch on every keystroke)
  useEffect(() => {
    fetchComments(currentPage, pageSize, statusFilter, searchText);
  }, [currentPage, pageSize, statusFilter]);

  // Optimistic update handlers
  const handleApprove = useCallback(
    async (commentId: number) => {
      try {
        // Optimistic update
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId ? { ...comment, status: 'approved' as Comment['status'] } : comment,
          ),
        );

        await commentsApi.admin.approveComment(commentId);
        message.success('Comment approved successfully');

        // If we're viewing only pending comments, remove the approved comment from view
        if (statusFilter === 'pending') {
          setComments((prev) => prev.filter((comment) => comment.id !== commentId));
          setTotal((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error('Failed to approve comment:', error);
        message.error('Failed to approve comment');
        // Revert optimistic update on error
        await fetchComments(currentPage, pageSize, statusFilter, searchText);
      }
    },
    [statusFilter, currentPage, pageSize, searchText, fetchComments, message],
  );

  const handleReject = useCallback(
    async (commentId: number) => {
      try {
        // Optimistic update
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId ? { ...comment, status: 'rejected' as Comment['status'] } : comment,
          ),
        );

        await commentsApi.admin.rejectComment(commentId);
        message.success('Comment rejected successfully');

        // If we're viewing only pending comments, remove the rejected comment from view
        if (statusFilter === 'pending') {
          setComments((prev) => prev.filter((comment) => comment.id !== commentId));
          setTotal((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error('Failed to reject comment:', error);
        message.error('Failed to reject comment');
        // Revert optimistic update on error
        await fetchComments(currentPage, pageSize, statusFilter, searchText);
      }
    },
    [statusFilter, currentPage, pageSize, searchText, fetchComments, message],
  );

  const handleDelete = useCallback(
    (commentId: number) => {
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

            // Remove from current view
            setComments((prev) => prev.filter((comment) => comment.id !== commentId));
            setTotal((prev) => Math.max(0, prev - 1));
          } catch (error) {
            console.error('Failed to delete comment:', error);
            message.error('Failed to delete comment');
          }
        },
      });
    },
    [message],
  );

  const handleView = useCallback((comment: Comment) => {
    setSelectedComment(comment);
    setDetailsModalOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchComments(currentPage, pageSize, statusFilter, searchText);
  }, [fetchComments, currentPage, pageSize, statusFilter, searchText]);

  // Debounced search - only triggers API call on search button click or enter
  const handleSearch = useCallback(
    (value: string) => {
      setSearchText(value);
      setCurrentPage(1);
      fetchComments(1, pageSize, statusFilter, value);
    },
    [pageSize, statusFilter, fetchComments],
  );

  const handleStatusFilterChange = useCallback((value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handlePaginationChange = useCallback(
    (page: number, size?: number) => {
      setCurrentPage(page);
      if (size && size !== pageSize) {
        setPageSize(size);
      }
    },
    [pageSize],
  );

  // Memoized helper functions
  const getStatusColor = useCallback((status: Comment['status']) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  }, []);

  const getStatusText = useCallback((status: Comment['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }, []);

  // Memoized table columns to prevent recreation
  const columns: ColumnsType<CommentsTableData> = useMemo(
    () => [
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
              <Text className={styles.name}>{record.user.name}</Text>
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
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status: Comment['status']) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
      },
      {
        title: 'Date',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 150,
        render: (date: string) => (
          <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>{dayjs(date).format('MMM DD, YYYY')}</Tooltip>
        ),
        sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 200,
        render: (_, record) => (
          <Space size="small">
            <Tooltip title="View Details">
              <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
            </Tooltip>
            {record.status === 'pending' && (
              <>
                <Tooltip title="Approve">
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => handleApprove(record.id)}
                    style={{ color: '#52c41a' }}
                  />
                </Tooltip>
                <Tooltip title="Reject">
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => handleReject(record.id)}
                    style={{ color: '#ff4d4f' }}
                  />
                </Tooltip>
              </>
            )}
            <Tooltip title="Delete">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
                danger
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [getStatusColor, getStatusText, handleView, handleApprove, handleReject, handleDelete],
  );

  // Memoized table data
  const tableData: CommentsTableData[] = useMemo(
    () =>
      comments.map((comment) => ({
        ...comment,
        key: comment.id.toString(),
      })),
    [comments],
  );

  // Memoized modal footer to prevent recreation
  const modalFooter = useMemo(() => {
    const baseButtons = [
      <Button key="close" onClick={() => setDetailsModalOpen(false)}>
        Close
      </Button>,
    ];

    if (selectedComment?.status === 'pending') {
      baseButtons.push(
        <Button
          key="approve"
          type="primary"
          icon={<CheckOutlined />}
          onClick={() => {
            if (selectedComment) {
              handleApprove(selectedComment.id);
              setDetailsModalOpen(false);
            }
          }}
        >
          Approve
        </Button>,
        <Button
          key="reject"
          danger
          icon={<CloseOutlined />}
          onClick={() => {
            if (selectedComment) {
              handleReject(selectedComment.id);
              setDetailsModalOpen(false);
            }
          }}
        >
          Reject
        </Button>,
      );
    }

    return baseButtons;
  }, [selectedComment, handleApprove, handleReject]);

  // Memoized search input handler to prevent recreation
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setSearchText('');
    }
  }, []);

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <Title level={3}>Comments Management</Title>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              Refresh
            </Button>
          </Space>
        </div>

        <div className={styles.filters}>
          <Space size="middle" wrap>
            <Search
              placeholder="Search comments, users, or IDs..."
              allowClear
              style={{ width: 300 }}
              onSearch={handleSearch}
              onChange={handleSearchInputChange}
              prefix={<SearchOutlined />}
            />
            <Select value={statusFilter} onChange={handleStatusFilterChange} style={{ width: 150 }}>
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Space>
        </div>

        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loading}>
              <Spin size="large" />
            </div>
          ) : comments.length === 0 ? (
            <Empty description="No comments found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                size="middle"
                className={styles.table}
              />
              <div className={styles.pagination}>
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} comments`}
                  onChange={handlePaginationChange}
                  onShowSizeChange={handlePaginationChange}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Comment Details Modal */}
      <Modal
        title="Comment Details"
        open={detailsModalOpen}
        onCancel={() => setDetailsModalOpen(false)}
        footer={modalFooter}
        width={600}
      >
        {selectedComment && (
          <div className={styles.commentDetails}>
            <div className={styles.userSection}>
              <Avatar size={48} icon={<UserOutlined />}>
                {selectedComment.user.name.charAt(0).toUpperCase()}
              </Avatar>
              <div className={styles.userInfo}>
                <Title level={5}>{selectedComment.user.name}</Title>
                <Text type="secondary">{selectedComment.user.email}</Text>
                <br />
                <Text type="secondary">ID: #{selectedComment.user.id}</Text>
              </div>
            </div>

            <div className={styles.commentSection}>
              <Title level={5}>Comment Content</Title>
              <Paragraph className={styles.content}>{selectedComment.content}</Paragraph>
            </div>

            <div className={styles.metaSection}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text strong>Product ID: </Text>
                  <Text>#{selectedComment.product_id}</Text>
                </div>
                <div>
                  <Text strong>Status: </Text>
                  <Tag color={getStatusColor(selectedComment.status)}>{getStatusText(selectedComment.status)}</Tag>
                </div>
                <div>
                  <Text strong>Created: </Text>
                  <Text>{dayjs(selectedComment.created_at).format('YYYY-MM-DD HH:mm:ss')}</Text>
                </div>
                {selectedComment.updated_at && (
                  <div>
                    <Text strong>Updated: </Text>
                    <Text>{dayjs(selectedComment.updated_at).format('YYYY-MM-DD HH:mm:ss')}</Text>
                  </div>
                )}
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
