import React, { useEffect, useState } from 'react';
import { productsApi } from '@/service/products/products.api';
import { BrandProps, CategoryProps, IProduct, TagProps } from '@/service/service.types';
import { catchErrorMessage, getFile } from '@/service/service.utils';
import { Controller, useForm } from 'react-hook-form';
import { DeleteOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { App, Button, Col, Form, Image, Input, InputNumber, Modal, Row, Select, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';

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
  image: File | null;
}

interface ProductEditProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product: IProduct | null;
}

export const ProductEditModal: React.FC<ProductEditProps> = ({ open, onClose, onSuccess, product }) => {
  const { message } = App.useApp();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [brands, setBrands] = useState<BrandProps[]>([]);
  const [tags, setTags] = useState<TagProps[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
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
      image: null,
    },
  });

  // Load filter options on open
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await productsApi.getFilterOptions();
        if (response.data) {
          setCategories(response.data.categories);
          setBrands(response.data.brands);
          setTags(response.data.tags);
        }
      } catch (error) {
        message.error('Failed to load filter options');
      }
    };
    if (open) loadOptions();
  }, [open, message]);

  // Reset form when product changes
  useEffect(() => {
    if (product && open) {
      reset({
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stock: product.stock,
        category_id: product.category_id,
        brand_id: product.brand_id,
        size: product.size,
        color: product.color,
        tags: product.tags.map((t) => t.id),
        image: null,
      });
      setImagePreview(getFile(product.image));
      setFileList([]);
      setImageFile(null);
    }
  }, [product, open, reset]);

  const onSubmit = async (data: ProductFormData) => {
    if (!product) return;
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('price', data.price.toString());
      formData.append('stock', data.stock.toString());
      formData.append('category_id', data.category_id.toString());
      formData.append('brand_id', data.brand_id.toString());
      formData.append('color', data.color || '');
      formData.append('size', data.size || '');
      if (data.tags && data.tags.length > 0) {
        data.tags.forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag.toString());
        });
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }
      await productsApi.admin.updateProduct(product.id, formData);
      message.success('Product updated successfully');
      onClose();
      onSuccess?.();
    } catch (error) {
      const errorMessage = catchErrorMessage(error) || 'Failed to update product';
      message.error(errorMessage);
    }
  };

  const handleImageChange = (info: any) => {
    const { fileList: newFileList } = info;
    const latestFileList = newFileList.slice(-1);
    setFileList(latestFileList);
    if (latestFileList.length > 0) {
      const file = latestFileList[0].originFileObj as File;
      if (file.size > 2 * 1024 * 1024) {
        message.error('Image must be less than 2MB');
        setFileList([]);
        setImageFile(null);
        setImagePreview(product?.image || null);
        setValue('image', null);
        return;
      }
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        message.error('Please upload a valid image file (JPEG, PNG, GIF)');
        setFileList([]);
        setImageFile(null);
        setImagePreview(product?.image || null);
        setValue('image', null);
        return;
      }
      setImageFile(file);
      setValue('image', file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(product?.image || null);
      setValue('image', null);
    }
  };

  const removeImage = () => {
    setFileList([]);
    setImageFile(null);
    setImagePreview(null);
    setValue('image', null);
  };

  const handleCancel = () => {
    onClose();
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stock: product.stock,
        category_id: product.category_id,
        brand_id: product.brand_id,
        size: product.size,
        color: product.color,
        tags: product.tags.map((t) => t.id),
        image: null,
      });
      setImagePreview(product.image);
      setFileList([]);
      setImageFile(null);
    }
  };

  return (
    <Modal title="Edit Product" open={open} onCancel={handleCancel} footer={null} width={800} destroyOnClose>
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
                rules={{
                  required: 'Product name is required',
                  maxLength: { value: 255, message: 'Name must be less than 255 characters' },
                }}
                render={({ field }) => <Input {...field} placeholder="Enter product name" />}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Price" validateStatus={errors.price ? 'error' : ''} help={errors.price?.message} required>
              <Controller
                name="price"
                control={control}
                rules={{ required: 'Price is required', min: { value: 0.01, message: 'Price must be greater than 0' } }}
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
                    {categories.map((cat) => (
                      <Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </Option>
                    ))}
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
                    {brands.map((b) => (
                      <Option key={b.id} value={b.id}>
                        {b.name}
                      </Option>
                    ))}
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
                rules={{ maxLength: { value: 20, message: 'Size must be less than 20 characters' } }}
                render={({ field }) => <Input {...field} placeholder="Size (optional)" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Color" validateStatus={errors.color ? 'error' : ''} help={errors.color?.message}>
              <Controller
                name="color"
                control={control}
                rules={{ maxLength: { value: 50, message: 'Color must be less than 50 characters' } }}
                render={({ field }) => <Input {...field} placeholder="Color (optional)" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Description"
          validateStatus={errors.description ? 'error' : ''}
          help={errors.description?.message}
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => <TextArea {...field} rows={4} placeholder="Enter product description (optional)" />}
          />
        </Form.Item>

        <Form.Item label="Tags">
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <Select {...field} mode="multiple" placeholder="Select tags (optional)" style={{ width: '100%' }}>
                {tags.map((tag) => (
                  <Option key={tag.id} value={tag.id}>
                    {tag.name}
                  </Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item label="Product Image">
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <div>
                <Upload
                  fileList={fileList}
                  beforeUpload={() => false}
                  onChange={handleImageChange}
                  accept="image/*"
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />} disabled={fileList.length >= 1}>
                    Upload Image (Max 2MB)
                  </Button>
                </Upload>
                {imagePreview && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <span>Preview:</span>
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={removeImage}
                        style={{ marginLeft: 8 }}
                      >
                        Remove
                      </Button>
                    </div>
                    <Image src={imagePreview} alt="Product preview" style={{ maxWidth: 200, maxHeight: 200 }} />
                  </div>
                )}
              </div>
            )}
          />
        </Form.Item>

        <Form.Item>
          <Row gutter={16}>
            <Col>
              <Button onClick={handleCancel}>Cancel</Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" loading={isSubmitting} icon={<SaveOutlined />}>
                Update Product
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductEditModal;
