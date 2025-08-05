import React, { useEffect, useState } from 'react';
import { productsApi } from '@/service/products/products.api';
import { IProduct } from '@/service/service.types';
import { catchErrorMessage, getFile } from '@/service/service.utils';
import { selectBrands, selectCategories, selectCommonError, selectTags } from '@/store/common/common.selectors';
import { fetchFilterOptions } from '@/store/common/common.slice';
import { AppDispatch } from '@/store/store';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
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
  category_id: number | undefined;
  brand_id: number | undefined;
  size: string;
  color: string;
  tags: number[];
  image: File | null;
}

interface ProductManageModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product?: IProduct | null; // Optional - if provided, it's edit mode
  mode?: 'create' | 'edit'; // Optional - can be inferred from product prop
}

export const ProductManageModal: React.FC<ProductManageModalProps> = ({
  open,
  onClose,
  onSuccess,
  product = null,
  mode,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { message } = App.useApp();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const categories = useSelector(selectCategories);
  const brands = useSelector(selectBrands);
  const tags = useSelector(selectTags);
  const commonError = useSelector(selectCommonError);

  // Determine if we're in edit mode
  const isEditMode = mode === 'edit' || !!product;
  const modalTitle = isEditMode ? 'Edit Product' : 'Create Product';
  const submitButtonText = isEditMode ? 'Update Product' : 'Create Product';

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
      category_id: undefined, // Changed from 0 to undefined
      brand_id: undefined, // Changed from 0 to undefined
      size: '',
      color: '',
      tags: [],
      image: null,
    },
  });

  // Load filter options when modal opens
  useEffect(() => {
    if (open) {
      dispatch(fetchFilterOptions());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (commonError) {
      message.error(commonError);
    }
  }, [commonError, message]);

  // Reset form when modal opens or product changes
  useEffect(() => {
    if (open) {
      if (isEditMode && product) {
        // Edit mode - populate form with existing product data
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
      } else {
        // Create mode - reset to default values with undefined for selects
        reset({
          name: '',
          description: '',
          price: 0,
          stock: 0,
          category_id: undefined, // Changed from 0 to undefined
          brand_id: undefined, // Changed from 0 to undefined
          size: '',
          color: '',
          tags: [],
          image: null,
        });
        setImagePreview(null);
        setFileList([]);
        setImageFile(null);
      }
    }
  }, [open, isEditMode, product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      const formData = new FormData();

      // Append all form fields
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('price', data.price.toString());
      formData.append('stock', data.stock.toString());

      // Only append category_id and brand_id if they have valid values
      if (data.category_id) {
        formData.append('category_id', data.category_id.toString());
      }
      if (data.brand_id) {
        formData.append('brand_id', data.brand_id.toString());
      }

      formData.append('color', data.color || '');
      formData.append('size', data.size || '');

      // Handle tags array
      if (data.tags && data.tags.length > 0) {
        data.tags.forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag.toString());
        });
      }

      // Handle image logic
      if (isEditMode && product) {
        // Edit mode image handling
        if (imageFile) {
          // New image uploaded - use it
          formData.append('image', imageFile);
        } else if (!imagePreview) {
          // No preview means user wants to delete the image
          formData.append('delete_image', 'true');
        }
        // If imagePreview exists but no new imageFile, keep existing image (do nothing)

        await productsApi.admin.updateProduct(product.id, formData);
        message.success('Product updated successfully');
      } else {
        // Create mode image handling
        if (imageFile) {
          formData.append('image', imageFile);
        }

        await productsApi.admin.createProduct(formData);
        message.success('Product created successfully');
      }

      // Reset form and close modal
      handleClose();
      onSuccess?.();
    } catch (error) {
      const errorMessage = catchErrorMessage(error);
      message.error(errorMessage || `Failed to ${isEditMode ? 'update' : 'create'} product`);
    }
  };

  const handleImageChange = (info: any) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);

    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      if (file) {
        // Validate file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
          message.error('Image must be smaller than 2MB');
          setFileList([]);
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          message.error('Please upload a valid image file');
          setFileList([]);
          return;
        }

        setImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setImageFile(null);
      setImagePreview(isEditMode && product ? getFile(product.image) : null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFileList([]);
  };

  const handleClose = () => {
    // Reset all state when closing
    reset();
    setImageFile(null);
    setImagePreview(null);
    setFileList([]);
    onClose();
  };

  const handleCancel = () => {
    handleClose();
  };

  return (
    <Modal title={modalTitle} open={open} onCancel={handleCancel} footer={null} width={800} destroyOnClose>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Product Name"
              required
              validateStatus={errors.name ? 'error' : ''}
              help={errors.name?.message}
            >
              <Controller
                name="name"
                control={control}
                rules={{
                  required: 'Product name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  maxLength: { value: 255, message: 'Name must be less than 255 characters' },
                }}
                render={({ field }) => <Input {...field} placeholder="Enter product name" />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Price" required validateStatus={errors.price ? 'error' : ''} help={errors.price?.message}>
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
                    placeholder="0.00"
                    precision={2}
                    min={0}
                    step={0.01}
                    formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    //   parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Category"
              required
              validateStatus={errors.category_id ? 'error' : ''}
              help={errors.category_id?.message}
            >
              <Controller
                name="category_id"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <Select {...field} placeholder="Select category" style={{ width: '100%' }} allowClear>
                    {categories.map((category) => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Brand"
              required
              validateStatus={errors.brand_id ? 'error' : ''}
              help={errors.brand_id?.message}
            >
              <Controller
                name="brand_id"
                control={control}
                rules={{ required: 'Brand is required' }}
                render={({ field }) => (
                  <Select {...field} placeholder="Select brand" style={{ width: '100%' }} allowClear>
                    {brands.map((brand) => (
                      <Option key={brand.id} value={brand.id}>
                        {brand.name}
                      </Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Stock" required validateStatus={errors.stock ? 'error' : ''} help={errors.stock?.message}>
              <Controller
                name="stock"
                control={control}
                rules={{
                  required: 'Stock is required',
                  min: { value: 0, message: 'Stock cannot be negative' },
                }}
                render={({ field }) => (
                  <InputNumber {...field} style={{ width: '100%' }} placeholder="0" min={0} step={1} precision={0} />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Size" validateStatus={errors.size ? 'error' : ''} help={errors.size?.message}>
              <Controller
                name="size"
                control={control}
                rules={{ maxLength: { value: 50, message: 'Size must be less than 50 characters' } }}
                render={({ field }) => <Input {...field} placeholder="Size (optional)" />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
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
                {submitButtonText}
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  );
};
