import React, { useEffect, useState } from 'react';
import { productsApi } from '@/service/products/products.api';
import { Comment, IProduct } from '@/service/service.types';
import { getFile } from '@/service/service.utils';
import { useParams } from 'react-router';
import { App, Avatar, Button, Card, Col, Form, Image, Input, List, Row, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';

import styles from './product.module.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const ProductPage: React.FC = () => {
  const { message } = App.useApp();
  const { id } = useParams();
  const productId = Number(id);

  const [product, setProduct] = useState<IProduct | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentValue, setCommentValue] = useState('');

  useEffect(() => {
    if (!productId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, commentsRes] = await Promise.all([
          productsApi.getProduct(productId),
          productsApi.getProductComments(productId),
        ]);
        if (productRes.data) {
          setProduct(productRes.data);
        }
        if (commentsRes.data) {
          setComments(commentsRes.data.data);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        message.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId, message]);

  const handleAddComment = async () => {
    if (!commentValue.trim()) return;
    try {
      setSubmitting(true);
      const response = await productsApi.createComment(productId, { content: commentValue });
      if (response.data) {
        setComments((prev) => [response.data, ...prev]);
        setCommentValue('');
        message.success('Comment added successfully');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      message.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

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
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                avatar={<Avatar>{item.user?.name?.[0] || 'U'}</Avatar>}
                title={
                  <Space>
                    <Text>{item.user?.name}</Text>
                    <Text type="secondary">{dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}</Text>
                  </Space>
                }
                description={item.content}
              />
              <Tag color={item.status === 'approved' ? 'green' : item.status === 'rejected' ? 'red' : 'orange'}>
                {item.status}
              </Tag>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default ProductPage;
