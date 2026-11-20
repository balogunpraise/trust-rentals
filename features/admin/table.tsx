export function AdminTable({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-line bg-canvas text-xs text-muted uppercase">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold tracking-wide">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}
export const td = "px-4 py-3 align-middle";
