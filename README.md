# 快消品经营洞察分析系统

## 项目背景

本项目基于 2023—2025 年快消品销售利润原始 CSV 数据，构建一个本地运行的前端数据可视化系统。页面通过浏览器动态读取原始数据、实时筛选并聚合结果，用于课程展示、经营分析和交互式探索。

英文名称：`FMCG Business Insight Dashboard`

## 数据来源说明

- 主数据源：`public/data/fmcg_sales_cleaned_2023_2025.csv`
- 备用对照文件：`public/data/member_b_analysis_result.xlsx`
- 备用汇总文件：`public/data/analysis/*.csv`

主流程只读取主数据源，不依赖 Excel 或静态 summary CSV 做页面渲染。

## 技术栈

- React
- Vite
- TypeScript
- Ant Design
- ECharts
- echarts-for-react
- PapaParse

## 页面功能说明

### 1. 首页概览

- 展示总订单数、总销量、总净收入、总利润和整体利润率
- 展示年度净收入与利润趋势图
- 展示年度聚合表格
- 展示整体经营结论

### 2. 促销分析

- 支持年份、地区、销售渠道、产品品类、促销类型筛选
- 对折扣区间进行动态聚合
- 可切换平均销量、平均净收入、平均利润、平均利润率
- 图表、表格和结论同步更新

### 3. 业务维度分析

- 支持销售渠道、产品品类、地区市场三个维度切换
- 支持按利润、净收入、利润率排序
- 使用组合图和柱状图展示业务差异
- 输出动态业务洞察

### 4. 数据探索器

- 自定义分析维度、分析指标、图表类型和排序方式
- 基于原始 CSV 实时筛选与聚合
- 支持柱状图、折线图、饼图
- 图表下方展示聚合表格
- 空数据场景安全处理

## 动态聚合说明

- 页面加载时通过 `fetch('/data/fmcg_sales_cleaned_2023_2025.csv')` 读取主数据源
- 使用 PapaParse 解析 CSV
- 将原始字段转换为 camelCase 的前端数据结构
- 根据 `Discount_Pct` 自动生成 `discountBin`
- 用户每次筛选、切换维度或指标时，都会基于原始行数据重新分组聚合
- 聚合逻辑集中在 `src/utils/aggregator.ts`
- 图表配置集中在 `src/utils/chartOptions.ts`

## 本地启动方式

```bash
npm install
npm run dev
```

启动后可访问：

- `http://localhost:5173/`
- `http://localhost:5173/data/fmcg_sales_cleaned_2023_2025.csv`

## 构建方式

```bash
npm run build
```

## 数据文件路径说明

项目推荐结构如下：

```text
fmcg-business-insight/
├─ public/
│  └─ data/
│     ├─ fmcg_sales_cleaned_2023_2025.csv
│     ├─ member_b_analysis_result.xlsx
│     └─ analysis/
│        ├─ year_summary.csv
│        ├─ discount_summary.csv
│        ├─ channel_summary.csv
│        ├─ category_summary.csv
│        ├─ region_summary.csv
│        └─ correlation_matrix.csv
├─ src/
│  ├─ components/
│  ├─ constants/
│  ├─ hooks/
│  ├─ pages/
│  ├─ types/
│  └─ utils/
└─ README.md
```
