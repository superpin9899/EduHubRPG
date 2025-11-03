import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, currentFloor, currentHp, enemiesDefeated, totalExpEarned, itemsFound, currentEnemy } = body;

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId es requerido' }),
      };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

    // Preparar los datos a actualizar
    const updateData: any = {};
    if (currentFloor !== undefined) updateData.current_floor = currentFloor;
    if (currentHp !== undefined) updateData.current_hp = currentHp;
    if (enemiesDefeated !== undefined) updateData.enemies_defeated = enemiesDefeated;
    if (totalExpEarned !== undefined) updateData.total_exp_earned = totalExpEarned;
    if (itemsFound !== undefined) updateData.items_found = itemsFound;
    if (currentEnemy !== undefined) updateData.current_enemy = currentEnemy;

    // Si HP es 0, marcar run como inactiva
    if (currentHp !== undefined && currentHp <= 0) {
      updateData.is_active = false;
    }

    // Intentar hacer PATCH primero (si existe, actualiza)
    const patchResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/dungeon_progress?user_id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    // Si PATCH funciona, devolver resultado
    if (patchResponse.ok) {
      const patchData = await patchResponse.json().catch(() => []);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(patchData),
      };
    }

    // Si PATCH falla porque no existe (404), hacer INSERT con POST
    if (patchResponse.status === 404) {
      const postResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/dungeon_progress`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            ...updateData,
          }),
        }
      );

      if (!postResponse.ok) {
        const errorText = await postResponse.text();
        console.error(`❌ Error POST: ${postResponse.status}`, errorText);
        return {
          statusCode: postResponse.status,
          headers,
          body: JSON.stringify({ error: errorText }),
        };
      }

      const postData = await postResponse.json().catch(() => []);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(postData),
      };
    }

    // Si PATCH falla por otro motivo, devolver error
    const errorText = await patchResponse.text();
    console.error(`❌ Error PATCH: ${patchResponse.status}`, errorText);
    return {
      statusCode: patchResponse.status,
      headers,
      body: JSON.stringify({ error: errorText }),
    };
  } catch (error: any) {
    console.error('❌ Error en updateDungeonProgress:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Error desconocido',
        stack: error.stack 
      }),
    };
  }
};

