import { Card, Typography } from 'antd';

const { Paragraph } = Typography;

interface InsightCardProps {
  title: string;
  content: string;
}

export function InsightCard({ title, content }: InsightCardProps) {
  return (
    <Card className="insight-card" title={title} bordered={false}>
      <Paragraph>{content}</Paragraph>
    </Card>
  );
}
