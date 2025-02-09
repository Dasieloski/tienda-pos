import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const TableSkeleton = () => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Almacén Principal</TableHead>
                    <TableHead>Almacén de Ventas</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                            <div className="h-8 w-24 bg-gray-200 rounded"></div>
                        </TableCell>
                        <TableCell>
                            <div className="h-8 w-16 bg-gray-200 rounded"></div>
                        </TableCell>
                        <TableCell>
                            <div className="h-8 w-12 bg-gray-200 rounded"></div>
                        </TableCell>
                        <TableCell>
                            <div className="h-8 w-12 bg-gray-200 rounded"></div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

