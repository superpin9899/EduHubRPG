import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const monsterCode = event.queryStringParameters?.monsterCode;
    const level = parseInt(event.queryStringParameters?.level || '1');
    const floor = parseInt(event.queryStringParameters?.floor || '1');

    if (!monsterCode) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'monsterCode es requerido' }),
      };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

    // Llamar a la función PostgreSQL que calcula los stats
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/calculate_monster_stats`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        monster_code: monsterCode,
        monster_level: level,
        floor_number: floor
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error }),
      };
    }

    const data = await response.json();
    
    // La función devuelve un array, tomamos el primer elemento
    const stats = Array.isArray(data) ? data[0] : data;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(stats),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

