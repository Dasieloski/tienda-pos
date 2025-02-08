import { TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function TableSkeleton() {
    return (
        <>
            {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell>
                        <Skeleton className="h-12 w-12" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-[250px]" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-8 w-[100px]" />
                    </TableCell>
                </TableRow>
            ))}
        </>
    )
}

