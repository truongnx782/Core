import React, { useEffect, useState } from "react";
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
  SafetyOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import {
  fetchUsersRequest,
  createUserRequest,
  updateUserRequest,
  deleteUserRequest,
  setSelectedUser,
  setKeyword,
  setRoleFilter,
} from "../userSlice";
import { useDebounce } from "../../../hooks/useDebounce";
import { usePagination } from "../../../hooks/usePagination";
import { useMutation } from "../../../hooks/useMutation";
import GenericTable from "../../../components/common/GenericTable";
import AppButton from "../../../components/common/AppButton";
import AppModal from "../../../components/common/AppModal";
import InputField from "../../../components/common/InputField";
import type { ColumnsType } from "antd/es/table";
import type { UserInfo } from "../../auth/authTypes";
import { useTranslation } from "react-i18next";

const { Title } = Typography;
const { Option } = Select;

const ROLE_OPTIONS = ["ADMIN", "MANAGER", "USER"];
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "red",
  MANAGER: "blue",
  USER: "green",
};

/**
 * Page component for managing system users.
 * Requires ADMIN role for full CRUD capabilities.
 *
 * Component trang quản trị người dùng.
 * Yêu cầu quyền ADMIN để thực hiện các thao tác CRUD.
 */
const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { users, loading, filters, selectedUser } = useSelector(
    (s: RootState) => s.users,
  );
  const [searchValue, setSearchValue] = useState(filters.keyword);
  const debouncedSearch = useDebounce(searchValue, 400);

  // Pagination & Fetching
  const pagination = usePagination(
    (s: RootState) => s.users.pagination,
    fetchUsersRequest,
    { keyword: debouncedSearch, role: filters.role },
  );

  useEffect(() => {
    pagination.onPageChange(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.role]);

  // Mutation (Create/Update)
  const { mutate, isLoading: isSaving } = useMutation({
    selector: (s: RootState) => s.users,
    onSuccess: () => {
      setIsModalOpen(false);
      form.resetFields();
    },
  });

  // Sync search to Redux
  useEffect(() => {
    dispatch(setKeyword(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  // Fill form when editing
  useEffect(() => {
    if (isModalOpen && isEditMode && selectedUser) {
      form.setFieldsValue(selectedUser);
    }
  }, [isModalOpen, isEditMode, selectedUser, form]);

  // ---- Handlers ----
  const handleOpenModal = (user?: UserInfo) => {
    setIsEditMode(!!user);
    dispatch(setSelectedUser(user || null));
    if (!user) form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    if (isEditMode && selectedUser) {
      mutate(updateUserRequest({ id: selectedUser.id, data: values }));
    } else {
      mutate(createUserRequest(values));
    }
  };

  const handleDelete = (id: number) => dispatch(deleteUserRequest(id));

  // ---- Table Columns ----
  const columns: ColumnsType<UserInfo> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: t("common.username"),
      dataIndex: "username",
      key: "username",
      width: 140,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: t("common.email"),
      dataIndex: "email",
      key: "email",
      width: 220,
    },
    {
      title: t("common.fullName"),
      dataIndex: "fullName",
      key: "fullName",
      width: 180,
      render: (text: string) => text || "—",
    },
    {
      title: t("common.phone"),
      dataIndex: "phone",
      key: "phone",
      width: 140,
      render: (text: string) => text || "—",
    },
    {
      title: t("common.role"),
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (role: string) => (
        <Tag color={ROLE_COLORS[role] || "default"}>{role}</Tag>
      ),
    },
    {
      title: t("common.status"),
      dataIndex: "active",
      key: "active",
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? "success" : "error"}>
          {active ? t("users.active") : t("users.inactive")}
        </Tag>
      ),
    },
    {
      title: t("common.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "—",
    },
    {
      title: t("common.actions"),
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_: unknown, record: UserInfo) => (
        <Space>
          <Tooltip title={t("common.edit")}>
            <AppButton
              variant="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title={t("common.delete")}
            description={`${t("users.deleteConfirm")} (${record.username})?`}
            onConfirm={() => handleDelete(record.id)}
            okText={t("common.yes")}
            cancelText={t("common.no")}
            okButtonProps={{ danger: true }}
          >
            <Tooltip title={t("common.delete")}>
              <AppButton
                variant="danger"
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const activeCount = users.filter((u) => u.active).length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, borderLeft: "4px solid #1677ff" }}>
            <Statistic
              title={t("users.totalUsers")}
              value={pagination.totalElements}
              prefix={<TeamOutlined style={{ color: "#1677ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, borderLeft: "4px solid #52c41a" }}>
            <Statistic
              title={t("users.activeUsers")}
              value={activeCount}
              prefix={<UserOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, borderLeft: "4px solid #ff4d4f" }}>
            <Statistic
              title={t("users.adminUsers")}
              value={adminCount}
              prefix={<SafetyOutlined style={{ color: "#ff4d4f" }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {t("users.title")}
            </Title>
          </Col>
          <Col>
            <Space size={12}>
              <Input
                placeholder={t("common.search")}
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                allowClear
                style={{ width: 220, borderRadius: 8 }}
              />
              <Select
                placeholder={t("common.role")}
                value={filters.role || undefined}
                onChange={(v) => dispatch(setRoleFilter(v || ""))}
                allowClear
                style={{ width: 140 }}
              >
                {ROLE_OPTIONS.map((r) => (
                  <Option key={r} value={r}>
                    {r}
                  </Option>
                ))}
              </Select>
              <AppButton
                icon={<ReloadOutlined />}
                onClick={pagination.refresh}
              />
              <AppButton
                variant="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal()}
              >
                {t("users.addUser")}
              </AppButton>
            </Space>
          </Col>
        </Row>

        <GenericTable<UserInfo>
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.currentPage,
            pageSize: pagination.size,
            total: pagination.totalElements,
            onChange: pagination.onPageChange,
            showSizeChanger: true,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <AppModal
        title={isEditMode ? t("users.updateUser") : t("users.addUser")}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isSaving}
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <InputField
                name="username"
                label={t("common.username")}
                required
                placeholder="username"
              />
            </Col>
            <Col span={12}>
              <InputField
                name="email"
                label={t("common.email")}
                required
                placeholder="example@mail.com"
              />
            </Col>
          </Row>
          {!isEditMode && (
            <InputField
              name="password"
              label={t("common.password")}
              required
              type="password"
              placeholder="******"
            />
          )}
          <Row gutter={16}>
            <Col span={12}>
              <InputField
                name="fullName"
                label={t("common.fullName")}
                placeholder="Nguyễn Văn A"
              />
            </Col>
            <Col span={12}>
              <InputField
                name="phone"
                label={t("common.phone")}
                placeholder="0987..."
              />
            </Col>
          </Row>
          <Form.Item
            name="role"
            label={t("common.role")}
            rules={[{ required: true, message: t("users.roleRequired") }]}
          >
            <Select placeholder={t("common.selectRole")}>
              {ROLE_OPTIONS.map((r) => (
                <Option key={r} value={r}>
                  <Tag color={ROLE_COLORS[r]}>{r}</Tag>
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
