const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database query wrapper functions
const db = {
  query: async (text, params) => {
    try {
      // Convert PostgreSQL queries to Supabase format
      const tableName = extractTableName(text);
      
      if (text.trim().toUpperCase().startsWith('SELECT')) {
        return await handleSelect(text, params, tableName);
      } else if (text.trim().toUpperCase().startsWith('INSERT')) {
        return await handleInsert(text, params, tableName);
      } else if (text.trim().toUpperCase().startsWith('UPDATE')) {
        return await handleUpdate(text, params, tableName);
      } else if (text.trim().toUpperCase().startsWith('DELETE')) {
        return await handleDelete(text, params, tableName);
      }
      
      throw new Error('Unsupported query type');
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
};

function extractTableName(query) {
  const match = query.match(/(?:FROM|INTO|UPDATE|JOIN)\s+(\w+)/i);
  return match ? match[1] : null;
}

async function handleSelect(query, params, tableName) {
  // Simple implementation - you can enhance this
  const { data, error } = await supabase
    .from(tableName)
    .select('*');
    
  if (error) throw error;
  return { rows: data };
}

async function handleInsert(query, params, tableName) {
  // Extract INSERT values and convert to object
  // This is a simplified implementation
  const { data, error } = await supabase
    .from(tableName)
    .insert(params)
    .select();
    
  if (error) throw error;
  return { rows: data };
}

async function handleUpdate(query, params, tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .update(params)
    .select();
    
  if (error) throw error;
  return { rows: data };
}

async function handleDelete(query, params, tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .select();
    
  if (error) throw error;
  return { rows: data };
}

module.exports = db;
