import cron from 'node-cron';

import { deleteExpiredMessages } from '@/actions/delete-expired-messages';

export function startCronJobs() {

  cron.schedule('* * * * *', async () => {
    console.log('Ejecutando tarea de limpieza de mensajes temporales');
    try {
      const deletedCount = await deleteExpiredMessages();
      console.log(`Se eliminaron ${deletedCount} mensajes temporales`);
    } catch (error) {
      console.error('Error al eliminar mensajes temporales:', error);
    }
  });
}
