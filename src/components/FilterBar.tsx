import { Button, Card, Select, Space, Typography } from 'antd';
import type { FilterOptions, FilterState } from '../types/fmcg';

const { Text } = Typography;

interface FilterBarProps {
  filters: FilterState;
  options: FilterOptions;
  onChange: (nextFilters: FilterState) => void;
}

export function FilterBar({ filters, options, onChange }: FilterBarProps) {
  return (
    <Card className="filter-bar" bordered={false}>
      <Space wrap size={[16, 16]} className="filter-bar__space">
        <div className="filter-item">
          <Text>年份</Text>
          <Select
            mode="multiple"
            allowClear
            placeholder="全部年份"
            value={filters.years}
            options={options.years.map((year) => ({ label: year, value: year }))}
            onChange={(years) => onChange({ ...filters, years: years as number[] })}
            className="filter-item__select"
          />
        </div>
        <div className="filter-item">
          <Text>地区</Text>
          <Select
            mode="multiple"
            allowClear
            placeholder="全部地区"
            value={filters.regions}
            options={options.regions.map((item) => ({ label: item, value: item }))}
            onChange={(regions) => onChange({ ...filters, regions: regions as string[] })}
            className="filter-item__select"
          />
        </div>
        <div className="filter-item">
          <Text>销售渠道</Text>
          <Select
            mode="multiple"
            allowClear
            placeholder="全部渠道"
            value={filters.salesChannels}
            options={options.salesChannels.map((item) => ({ label: item, value: item }))}
            onChange={(salesChannels) =>
              onChange({ ...filters, salesChannels: salesChannels as string[] })
            }
            className="filter-item__select"
          />
        </div>
        <div className="filter-item">
          <Text>产品品类</Text>
          <Select
            mode="multiple"
            allowClear
            placeholder="全部品类"
            value={filters.productCategories}
            options={options.productCategories.map((item) => ({ label: item, value: item }))}
            onChange={(productCategories) =>
              onChange({ ...filters, productCategories: productCategories as string[] })
            }
            className="filter-item__select"
          />
        </div>
        <div className="filter-item">
          <Text>促销类型</Text>
          <Select
            mode="multiple"
            allowClear
            placeholder="全部促销"
            value={filters.promotionTypes}
            options={options.promotionTypes.map((item) => ({ label: item, value: item }))}
            onChange={(promotionTypes) =>
              onChange({ ...filters, promotionTypes: promotionTypes as string[] })
            }
            className="filter-item__select"
          />
        </div>
        <div className="filter-item filter-item--action">
          <Text>操作</Text>
          <Button onClick={() => onChange({ years: [], regions: [], salesChannels: [], productCategories: [], promotionTypes: [] })}>
            重置筛选
          </Button>
        </div>
      </Space>
    </Card>
  );
}
