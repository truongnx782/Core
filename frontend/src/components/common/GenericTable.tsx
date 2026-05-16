import { Table, Empty } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";

interface GenericTableProps<T> {
  columns: ColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  rowKey: string | ((record: T) => string);
  pagination?: TablePaginationConfig | false;
  onChange?: (pagination: TablePaginationConfig) => void;
  scroll?: { x?: number | string; y?: number | string };
}

/**
 * Generic reusable table component wrapping Ant Design Table.
 * Provides consistent styling, loading states, and empty placeholders.
 *
 * Bảng dữ liệu (Table) dùng chung, tích hợp sẵn Ant Design Table.
 * Cung cấp style đồng nhất, trạng thái loading và text hiển thị khi không có dữ liệu.
 */
import { useTranslation } from "react-i18next";

function GenericTable<T extends object>({
  columns,
  dataSource,
  loading = false,
  rowKey,
  pagination = false,
  onChange,
  scroll,
}: GenericTableProps<T>) {
  const { t } = useTranslation();

  return (
    <Table<T>
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey={rowKey}
      pagination={pagination}
      onChange={(_pagination) => onChange?.(_pagination)}
      scroll={scroll || { x: "max-content" }}
      locale={{
        emptyText: <Empty description={t("common.noData")} />,
      }}
      style={{ borderRadius: 12, overflow: "hidden" }}
    />
  );
}

export default GenericTable;
