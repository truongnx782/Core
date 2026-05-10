import React, { useEffect, useState } from 'react';
import {
  Card,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  Form,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
  SafetyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store';
import {
  fetchUsersRequest,
  createUserRequest,
  updateUserRequest,
  deleteUserRequest,
  setSelectedUser,
  setKeyword,
  setRoleFilter,
} from '../userSlice';
import { useDebounce } from '../../../hooks/useDebounce';
import { usePagination } from '../../../hooks/usePagination';
import GenericTable from '../../../components/common/GenericTable';
import AppButton from '../../../components/common/AppButton';
import AppModal from '../../../components/common/AppModal';
import InputField from '../../../components/common/InputField';
import type { ColumnsType } from 'antd/es/table';
import type { UserInfo } from '../../auth/authTypes';
import type { CreateUserRequest, UpdateUserRequest } from '../userTypes';

const { Title } = Typography;
const { Option } = Select;

const ROLE_OPTIONS = ['ADMIN', 'MANAGER', 'USER'];
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'red',
  MANAGER: 'blue',
  USER: 'green',
};

/**
 * Page component for managing system users.
 * Requires ADMIN role for full CRUD capabilities.
 * 
 * Component trang quản trị người dùng.
 * Yêu cầu quyền ADMIN để thực hiện các thao tác CRUD.
 */
const UserManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, selectedUser, filters, pagination } = useSelector(
    (state: RootState) => state.users
  );
  const { currentPage, totalElements, onPageChange } = usePagination();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.keyword);
  const debouncedSearch = useDebounce(searchValue, 400);
  const [form] = Form.useForm();

  // Fetch users on mount and when filters change
  useEffect(() => {
    dispatch(
      fetchUsersRequest({
        keyword: debouncedSearch,
        role: filters.role,
        page: 0,
        size: pagination.size,
      })
    );
  }, [dispatch, debouncedSearch, filters.role]);

  // Sync debounced search to Redux
  useEffect(() => {
    dispatch(setKeyword(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  // Fill form values when editing
  useEffect(() => {
    if (isModalOpen && isEditMode && selectedUser) {
      form.setFieldsValue({
        username: selectedUser.username,
        email: selectedUser.email,
        fullName: selectedUser.fullName,
        phone: selectedUser.phone,
        role: selectedUser.role,
      });
    }
  }, [isModalOpen, isEditMode, selectedUser, form]);

  // ---- Modal Handlers ----
  const openCreateModal = () => {
    setIsEditMode(false);
    dispatch(setSelectedUser(null));
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserInfo) => {
    setIsEditMode(true);
    dispatch(setSelectedUser(user));
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (isEditMode && selectedUser) {
        const data: UpdateUserRequest = {
          username: values.username,
          email: values.email,
          fullName: values.fullName,
          phone: values.phone,
          role: values.role,
        };
        dispatch(updateUserRequest({ id: selectedUser.id, data }));
      } else {
        const data: CreateUserRequest = {
          username: values.username,
          email: values.email,
          password: values.password,
          fullName: values.fullName,
          phone: values.phone,
          role: values.role,
        };
        dispatch(createUserRequest(data));
      }
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const handleDelete = (id: number) => {
    dispatch(deleteUserRequest(id));
  };

  const handleRefresh = () => {
    dispatch(
      fetchUsersRequest({
        keyword: filters.keyword,
        role: filters.role,
        page: pagination.page,
        size: pagination.size,
      })
    );
  };

  // ---- Table Columns ----
  const columns: ColumnsType<UserInfo> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 140,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 180,
      render: (text: string) => text || '—',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (text: string) => text || '—',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={ROLE_COLORS[role] || 'default'}>{role}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString('vi-VN') : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_: any, record: UserInfo) => (
        <Space>
          <Tooltip title="Edit">
            <AppButton
              variant="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete user"
            description={`Are you sure you want to delete ${record.username}?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <AppButton variant="danger" icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Stats
  const activeCount = users.filter((u) => u.active).length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, borderLeft: '4px solid #1677ff' }}>
            <Statistic
              title="Total Users"
              value={totalElements}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, borderLeft: '4px solid #52c41a' }}>
            <Statistic
              title="Active Users"
              value={activeCount}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, borderLeft: '4px solid #ff4d4f' }}>
            <Statistic
              title="Admins"
              value={adminCount}
              prefix={<SafetyOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Card */}
      <Card
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        styles={{ body: { padding: '24px' } }}
      >
        {/* Toolbar */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              User Management
            </Title>
          </Col>
          <Col>
            <Space size={12}>
              <Input
                placeholder="Search users..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                allowClear
                style={{ width: 260, borderRadius: 8 }}
              />
              <Select
                placeholder="Filter by Role"
                value={filters.role || undefined}
                onChange={(value) => dispatch(setRoleFilter(value || ''))}
                allowClear
                style={{ width: 160 }}
              >
                {ROLE_OPTIONS.map((role) => (
                  <Option key={role} value={role}>
                    {role}
                  </Option>
                ))}
              </Select>
              <Tooltip title="Refresh">
                <AppButton
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                />
              </Tooltip>
              <AppButton
                variant="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Add User
              </AppButton>
            </Space>
          </Col>
        </Row>

        {/* Table */}
        <GenericTable<UserInfo>
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pagination.size,
            total: totalElements,
            onChange: onPageChange,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create / Edit Modal */}
      <AppModal
        title={isEditMode ? 'Edit User' : 'Create New User'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        okText={isEditMode ? 'Update' : 'Create'}
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <InputField
                name="username"
                label="Username"
                required={true}
                placeholder="Enter username"
              />
            </Col>
            <Col span={12}>
              <InputField
                name="email"
                label="Email"
                required={true}
                placeholder="Enter email"
              />
            </Col>
          </Row>

          {!isEditMode && (
            <InputField
              name="password"
              label="Password"
              required={true}
              type="password"
              placeholder="Enter password"
            />
          )}

          <Row gutter={16}>
            <Col span={12}>
              <InputField
                name="fullName"
                label="Full Name"
                placeholder="Enter full name"
              />
            </Col>
            <Col span={12}>
              <InputField
                name="phone"
                label="Phone"
                placeholder="Enter phone"
              />
            </Col>
          </Row>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Role is required' }]}
          >
            <Select placeholder="Select role" size="large">
              {ROLE_OPTIONS.map((role) => (
                <Option key={role} value={role}>
                  <Tag color={ROLE_COLORS[role]}>{role}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </AppModal>
    </div>
  );
};

export default UserManagementPage;
