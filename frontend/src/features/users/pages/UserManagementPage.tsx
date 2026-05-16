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
  setModalOpen,
  setEditMode,
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
import { useResponsive } from "../../../hooks/useResponsive";

const { Title } = Typography;
const { Option } = Select;

const ROLE_OPTIONS = ["ADMIN", "MANAGER", "USER"];
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "red",
  MANAGER: "blue",
  USER: "green",
};

const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const { isMobile, tableScrollX, modalWidth } = useResponsive();
  const { users, loading, filters, selectedUser, isModalOpen, isEditMode } =
    useSelector((s: RootState) => s.users);

  const [searchValue, setSearchValue] = useState(filters.keyword);
  const debouncedSearch = useDebounce(searchValue, 400);

  const pagination = usePagination(
    (s: RootState) => s.users.pagination,
    fetchUsersRequest,
    { keyword: debouncedSearch, role: filters.role },
  );

  // Sync back from Redux (e.g. if filters are reset elsewhere) / Đồng bộ ngược từ Redux nếu filter bị reset
  useEffect(() => {
    setSearchValue(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    pagination.onPageChange(1, 10);
  }, [debouncedSearch, filters.role]);

  const { mutate, isLoading: isSaving } = useMutation({
    selector: (s: RootState) => s.users,
    onSuccess: () => form.resetFields(),
  });

  useEffect(() => {
    dispatch(setKeyword(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    if (isModalOpen && isEditMode && selectedUser)
      form.setFieldsValue(selectedUser);
  }, [isModalOpen, isEditMode, selectedUser, form]);

  const handleOpenModal = (user?: UserInfo) => {
    dispatch(setEditMode(!!user));
    dispatch(setSelectedUser(user || null));
    if (!user) form.resetFields();
    dispatch(setModalOpen(true));
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    if (isEditMode && selectedUser) {
      mutate(updateUserRequest({ id: selectedUser.id, data: values }));
    } else {
      mutate(createUserRequest(values));
    }
  };

  const columns: ColumnsType<UserInfo> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
      sorter: (a, b) => a.id - b.id,
      responsive: ["sm"],
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
      responsive: ["md"],
    },
    {
      title: t("common.fullName"),
      dataIndex: "fullName",
      key: "fullName",
      width: 180,
      render: (text: string) => text || "—",
    },
    {
      title: t("common.role"),
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (role: string) => <Tag color={ROLE_COLORS[role]}>{role}</Tag>,
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
      title: t("common.actions"),
      key: "actions",
      width: 120,
      fixed: isMobile ? undefined : "right",
      render: (_, record) => (
        <Space>
          <AppButton
            variant="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title={t("common.delete")}
            onConfirm={() => dispatch(deleteUserRequest(record.id))}
          >
            <AppButton
              variant="danger"
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderLeft: "4px solid #1677ff" }}>
            <Statistic
              title={t("users.totalUsers")}
              value={pagination.totalElements}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderLeft: "4px solid #52c41a" }}>
            <Statistic
              title={t("users.activeUsers")}
              value={users.filter((u) => u.active).length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderLeft: "4px solid #ff4d4f" }}>
            <Statistic
              title={t("users.adminUsers")}
              value={users.filter((u) => u.role === "ADMIN").length}
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <Row
          gutter={[16, 16]}
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
            <Space size={12} wrap>
              <Input
                placeholder={t("common.search")}
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                allowClear
                style={{ width: isMobile ? "100%" : 200 }}
              />
              <Select
                placeholder={t("common.role")}
                value={filters.role || undefined}
                onChange={(v) => dispatch(setRoleFilter(v || ""))}
                allowClear
                style={{ width: 120 }}
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
          }}
          scroll={{ x: tableScrollX }}
        />
      </Card>

      <AppModal
        title={isEditMode ? t("users.updateUser") : t("users.addUser")}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => dispatch(setModalOpen(false))}
        confirmLoading={isSaving}
        width={modalWidth}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <InputField
                name="username"
                label={t("common.username")}
                required
              />
            </Col>
            <Col span={12}>
              <InputField name="email" label={t("common.email")} required />
            </Col>
          </Row>
          {!isEditMode && (
            <InputField
              name="password"
              label={t("common.password")}
              required
              type="password"
            />
          )}
          <Row gutter={16}>
            <Col span={12}>
              <InputField name="fullName" label={t("common.fullName")} />
            </Col>
            <Col span={12}>
              <InputField name="phone" label={t("common.phone")} />
            </Col>
          </Row>
          <Form.Item
            name="role"
            label={t("common.role")}
            rules={[{ required: true }]}
          >
            <Select>
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
