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
import dayjs from "dayjs";
import { useResponsive } from "../../../hooks/useResponsive";

const { Title } = Typography;
const { Option } = Select;

const ROLE_OPTIONS = ["ADMIN", "MANAGER", "USER"];
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "red",
  MANAGER: "blue",
  USER: "green",
};

/**
 * Page component for managing system users / Component trang quản trị người dùng.
 * Requires ADMIN role for full CRUD capabilities / Yêu cầu quyền ADMIN để thực hiện các thao tác CRUD.
 */
const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { isMobile, tableScrollX, modalWidth } = useResponsive();

  const { users, loading, filters, selectedUser } = useSelector(
    (s: RootState) => s.users,
  );
  const [searchValue, setSearchValue] = useState(filters.keyword);
  const debouncedSearch = useDebounce(searchValue, 400);

  // Pagination & Fetching / Phân trang & Lấy dữ liệu
  const pagination = usePagination(
    (s: RootState) => s.users.pagination,
    fetchUsersRequest,
    { keyword: debouncedSearch, role: filters.role },
  );

  useEffect(() => {
    pagination.onPageChange(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.role]);

  // Mutation (Create/Update) / Xử lý Thêm/Sửa
  const { mutate, isLoading: isSaving } = useMutation({
    selector: (s: RootState) => s.users,
    onSuccess: () => {
      setIsModalOpen(false);
      form.resetFields();
    },
  });

  // Sync search to Redux / Đồng bộ tìm kiếm với Redux
  useEffect(() => {
    dispatch(setKeyword(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  // Fill form when editing / Điền dữ liệu form khi chỉnh sửa
  useEffect(() => {
    if (isModalOpen && isEditMode && selectedUser) {
      form.setFieldsValue(selectedUser);
    }
  }, [isModalOpen, isEditMode, selectedUser, form]);

  // ---- Handlers / Các hàm xử lý sự kiện ----
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

  // ---- Table Columns / Cột dữ liệu bảng ----
  const columns: ColumnsType<UserInfo> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
      sorter: (a, b) => a.id - b.id,
      responsive: ["sm"], // Hide on mobile / Ẩn trên mobile
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
      responsive: ["md"], // Hide on tablet-small / Ẩn trên máy tính bảng nhỏ
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
      responsive: ["lg"], // Hide on mobile/tablet / Ẩn trên mobile/tablet
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
      responsive: ["xl"], // Only show on desktop / Chỉ hiện trên desktop
      render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },
    {
      title: t("common.actions"),
      key: "actions",
      width: 120,
      fixed: isMobile ? undefined : "right",
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
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderRadius: 12, borderLeft: "4px solid #1677ff" }}>
            <Statistic
              title={t("users.totalUsers")}
              value={pagination.totalElements}
              prefix={<TeamOutlined style={{ color: "#1677ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderRadius: 12, borderLeft: "4px solid #52c41a" }}>
            <Statistic
              title={t("users.activeUsers")}
              value={activeCount}
              prefix={<UserOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
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
          gutter={[16, 16]}
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col xs={24} md={12}>
            <Title level={4} style={{ margin: 0 }}>
              {t("users.title")}
            </Title>
          </Col>
          <Col xs={24} md={12}>
            <Space
              size={12}
              wrap
              style={{
                width: "100%",
                justifyContent: isMobile ? "flex-start" : "flex-end",
              }}
            >
              <Input
                placeholder={t("common.search")}
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                allowClear
                style={{ width: isMobile ? "100%" : 220, borderRadius: 8 }}
              />
              <Select
                placeholder={t("common.role")}
                value={filters.role || undefined}
                onChange={(v) => dispatch(setRoleFilter(v || ""))}
                allowClear
                style={{ width: isMobile ? "calc(100% - 100px)" : 140 }}
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
                block={isMobile}
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
          scroll={{ x: tableScrollX }}
        />
      </Card>

      <AppModal
        title={isEditMode ? t("users.updateUser") : t("users.addUser")}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isSaving}
        width={modalWidth}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <InputField
                name="username"
                label={t("common.username")}
                required
                placeholder="username"
              />
            </Col>
            <Col xs={24} sm={12}>
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
            <Col xs={24} sm={12}>
              <InputField
                name="fullName"
                label={t("common.fullName")}
                placeholder="Nguyễn Văn A"
              />
            </Col>
            <Col xs={24} sm={12}>
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
