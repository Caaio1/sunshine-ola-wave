
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Input } from "./input";
import { Button } from "./button";

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (row: T) => React.ReactNode;
}

interface StandardTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
}

export function StandardTable<T extends { id: string | number }>({ data, columns, pageSize = 10 }: StandardTableProps<T>) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = data.filter((row) =>
    Object.values(row).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <div>
          <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
          <span className="px-2">{page} / {totalPages}</span>
          <Button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Próximo</Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={String(col.key)}>{col.title}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={String(col.key)}>
                  {col.render ? col.render(row) : String((row as any)[col.key])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
