export const MobileField = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between gap-4 text-sm">
    <span className="text-text-muted">{label}</span>
    <span className="font-medium text-right text-text">{value}</span>
  </div>
);
