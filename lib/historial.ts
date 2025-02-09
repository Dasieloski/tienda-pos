   import { prisma } from '@/lib/prisma'

   export async function crearEntradaHistorial(action: string, details: string, user: string, location: string) {
       await prisma.historial.create({
           data: {
               action,
               details,
               user,
               location,
           },
       })
   }