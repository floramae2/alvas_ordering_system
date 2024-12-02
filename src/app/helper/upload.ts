import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
// Initialize Supabase client
const supabaseUrl = 'https://dbtzyebosltbhukbgmgt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidHp5ZWJvc2x0Ymh1a2JnbWd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzE0MjU0NSwiZXhwIjoyMDQ4NzE4NTQ1fQ.qKYeLXWCAttbni780B96xXd74TqZW4LOmt2TOmIjIpM';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadImage(file:File) {
  const filePath = `products/${uuidv4()}`; // Construct the file path in storage

  // Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('alvas') // Replace with your actual bucket name
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading file:', error.message);
    throw error;
  }

  // Generate the public URL
  const { data:{publicUrl} } = supabase.storage
    .from('alvas') // Replace with your actual bucket name
    .getPublicUrl(filePath);

  if (!publicUrl) {
    console.error('Error generating public URL:', "error");
    throw "Error";
  }

  console.log('Public URL:', publicUrl);

  return publicUrl; // Return the public URL
}
