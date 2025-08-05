import React, { useEffect, useState } from 'react';
import { commentsApi } from '@/service/comments/comments.api';
import { productsApi } from '@/service/products/products.api';
import { IProduct, ProductComment } from '@/service/service.types';
import { getFile } from '@/service/service.utils';
import { selectAuthUser } from '@/store/auth/auth.selectors';
import { formatDateTime } from '@/utils/date';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { App, Avatar, Button, Card, Col, Form, Image, Input, List, Row, Space, Tag, Typography } from 'antd';

import styles from './product.module.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const ProductPage: React.FC = () => {
  const { message } = App.useApp();
  const { id } = useParams();
  const productId = Number(id);

  const [product, setProduct] = useState<IProduct | null>(null);
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentValue, setCommentValue] = useState('');
  const authUser = useSelector(selectAuthUser);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [updating, setUpdating] = useState(false);

  const getComments = async (productId: number) => {
    try {
      const commentsRes = await productsApi.getProductComments(productId);
      setComments(commentsRes.data.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
      message.error('Failed to load comments');
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const [productRes] = await Promise.all([productsApi.getProduct(productId), getComments(productId)]);
      if (productRes.data) setProduct(productRes.data);
    } catch (error) {
      console.error('Failed to load product:', error);
      message.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    fetchComments();
  }, [productId, message]);

  const handleAddComment = async () => {
    if (!commentValue.trim()) return;
    try {
      setSubmitting(true);
      const response = await productsApi.createComment(productId, { content: commentValue });
      if (response.data) {
        setCommentValue('');
        message.success('Comment added successfully');
        await getComments(productId);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      message.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditComment = (comment: ProductComment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleUpdateComment = async () => {
    if (editingCommentId === null || !editingContent.trim()) return;
    try {
      setUpdating(true);
      await commentsApi.updateComment(editingCommentId, { content: editingContent });
      message.success('Comment updated successfully');
      await getComments(productId);
      cancelEditComment();
    } catch (error) {
      console.error('Failed to update comment:', error);
      message.error('Failed to update comment');
    } finally {
      setUpdating(false);
    }
  };

  console.log(authUser);

  return (
    <div className={styles.container}>
      <Card loading={loading} className={styles['product-card']}>
        {product && (
          <Row gutter={24}>
            <Col span={8}>
              <Image
                width="100%"
                src={product.image ? getFile(product.image) : 'https://placehold.co/400x400?text=No+Image'}
                fallback="https://placehold.co/400x400?text=No+Image"
              />
            </Col>
            <Col span={16}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Title level={2}>{product.name}</Title>
                <Text>{product.description}</Text>
                <Space size="middle">
                  <Text strong>Category:</Text>
                  <Tag color="blue">{product.category.name}</Tag>
                </Space>
                <Space size="middle">
                  <Text strong>Brand:</Text>
                  <Tag color="green">{product.brand.name}</Tag>
                </Space>
                <Text strong>Price: ${product.price}</Text>
                <Text strong>Stock: {product.stock}</Text>
                <Space wrap>
                  {product.tags.map((tag) => (
                    <Tag key={tag.id} color="purple">
                      {tag.name}
                    </Tag>
                  ))}
                </Space>
              </Space>
            </Col>
          </Row>
        )}
      </Card>

      <Card title={`Comments (${comments.length})`} className={styles['comments-card']}>
        <Form onFinish={handleAddComment} className={styles['comment-form']}>
          <Form.Item>
            <TextArea
              rows={4}
              value={commentValue}
              onChange={(e) => setCommentValue(e.target.value)}
              placeholder="Add a comment"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} disabled={!commentValue.trim()}>
              Add Comment
            </Button>
          </Form.Item>
        </Form>

        <List
          itemLayout="horizontal"
          dataSource={comments}
          locale={{ emptyText: 'No comments yet' }}
          renderItem={(item) => {
            // console.log(item);
            return (
              <List.Item
                key={item.id}
                actions={
                  authUser && authUser.id === item.user.id
                    ? editingCommentId === item.id
                      ? [
                          <Button type="link" onClick={handleUpdateComment} loading={updating}>
                            Save
                          </Button>,
                          <Button type="link" onClick={cancelEditComment}>
                            Cancel
                          </Button>,
                        ]
                      : [
                          <Button type="link" onClick={() => startEditComment(item)}>
                            Edit
                          </Button>,
                        ]
                    : undefined
                }
              >
                <List.Item.Meta
                  avatar={<Avatar>{item.user?.name?.[0] || 'U'}</Avatar>}
                  title={
                    <Space>
                      <Text>
                        {item.user?.name} {item.user.last_name}
                      </Text>
                      <Text type="secondary">{formatDateTime(item.created_at)}</Text>
                    </Space>
                  }
                  description={
                    editingCommentId === item.id ? (
                      <TextArea rows={2} value={editingContent} onChange={(e) => setEditingContent(e.target.value)} />
                    ) : (
                      item.content
                    )
                  }
                />
                <Tag color={item.status === 'approved' ? 'green' : item.status === 'rejected' ? 'red' : 'orange'}>
                  {item.status}
                </Tag>
              </List.Item>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default ProductPage;
