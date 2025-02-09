import cron from 'node-cron';
import fetch from 'node-fetch';

// Ejecutar todos los días a las 11:59 PM
cron.schedule('59 23 * * *', async () => {
    try {
        const response = await fetch('http://reinierstore.vercel.app/api/cash-register', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Error al guardar el registro de caja');
        }

        console.log('Registro de caja guardado exitosamente');
    } catch (error) {
        console.error('Error en el cron job:', error);
    }
});