import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
}

export function Table<T>({ data, columns, getRowKey, emptyMessage = "Nenhum registro encontrado" }: TableProps<T>) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-2 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr key={getRowKey(row)} className="hover:bg-slate-50">
              {columns.map((col, i) => (
                <td key={i} className={cn("px-4 py-2", col.className)}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
