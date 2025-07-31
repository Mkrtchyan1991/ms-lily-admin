import React from 'react';
import { productsApi } from '@/service/products/products.api';
import { CreateProductRequest } from '@/service/service.types';
import { Controller, useForm } from 'react-hook-form';
import { SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { App, Button, Col, Form, Input, InputNumber, Modal, Row, Select, Upload } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  brand_id: number;
  size: string;
  color: string;
  tags: number[];
  images: File[];
}

interface ProductCreateProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ProductCreateModal: React.FC<ProductCreateProps> = ({ open, onClose, onSuccess }) => {
  const { message } = App.useApp();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category_id: 0,
      brand_id: 0,
      size: '',
      color: '',
      tags: [],
      images: [],
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      const createData: CreateProductRequest = {
        name: data.name,
        description: data.description,
        price: data.price,
        category_id: data.category_id,
        brand_id: data.brand_id,
        tags: data.tags,
        images: data.images,
      };

      await productsApi.createProduct(createData);
      message.success('Product created successfully');
      reset();
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create product:', error);
      message.error('Failed to create product');
    }
  };

  return (
    <Modal title="Create New Product" open={open} onCancel={onClose} footer={null} width={800} destroyOnHidden>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Product Name"
              validateStatus={errors.name ? 'error' : ''}
              help={errors.name?.message}
              required
            >
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Product name is required' }}
                render={({ field }) => <Input {...field} placeholder="Enter product name" />}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Price" validateStatus={errors.price ? 'error' : ''} help={errors.price?.message} required>
              <Controller
                name="price"
                control={control}
                rules={{
                  required: 'Price is required',
                  min: { value: 0.01, message: 'Price must be greater than 0' },
                }}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: '100%' }}
                    placeholder="Enter price"
                    prefix="$"
                    min={0}
                    step={0.01}
                    precision={2}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Stock Quantity"
              validateStatus={errors.stock ? 'error' : ''}
              help={errors.stock?.message}
              required
            >
              <Controller
                name="stock"
                control={control}
                rules={{
                  required: 'Stock quantity is required',
                  min: { value: 0, message: 'Stock cannot be negative' },
                }}
                render={({ field }) => (
                  <InputNumber {...field} style={{ width: '100%' }} placeholder="Enter stock quantity" min={0} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Category"
              validateStatus={errors.category_id ? 'error' : ''}
              help={errors.category_id?.message}
              required
            >
              <Controller
                name="category_id"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <Select {...field} placeholder="Select category">
                    <Option value={1}>Electronics</Option>
                    <Option value={2}>Clothing</Option>
                    <Option value={3}>Books</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Brand"
              validateStatus={errors.brand_id ? 'error' : ''}
              help={errors.brand_id?.message}
              required
            >
              <Controller
                name="brand_id"
                control={control}
                rules={{ required: 'Brand is required' }}
                render={({ field }) => (
                  <Select {...field} placeholder="Select brand">
                    <Option value={1}>Apple</Option>
                    <Option value={2}>Samsung</Option>
                    <Option value={3}>Nike</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Size" validateStatus={errors.size ? 'error' : ''} help={errors.size?.message}>
              <Controller
                name="size"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Size" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Color" validateStatus={errors.color ? 'error' : ''} help={errors.color?.message}>
              <Controller
                name="color"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Color" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Description"
          validateStatus={errors.description ? 'error' : ''}
          help={errors.description?.message}
          required
        >
          <Controller
            name="description"
            control={control}
            rules={{ required: 'Description is required' }}
            render={({ field }) => <TextArea {...field} rows={4} placeholder="Enter product description" />}
          />
        </Form.Item>

        <Form.Item label="Tags">
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <Select {...field} mode="multiple" placeholder="Select tags" style={{ width: '100%' }}>
                <Option value={1}>Popular</Option>
                <Option value={2}>New</Option>
                <Option value={3}>Sale</Option>
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item label="Product Images">
          <Controller
            name="images"
            control={control}
            render={({ field }) => (
              <Upload
                multiple
                beforeUpload={() => false}
                onChange={(info) => {
                  const files = info.fileList.map((file) => file.originFileObj).filter(Boolean) as File[];
                  field.onChange(files);
                }}
              >
                <Button icon={<UploadOutlined />}>Upload Images</Button>
              </Upload>
            )}
          />
        </Form.Item>

        <Form.Item>
          <Row gutter={16}>
            <Col>
              <Button onClick={onClose}>Cancel</Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" loading={isSubmitting} icon={<SaveOutlined />}>
                Create Product
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  );
};
