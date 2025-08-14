import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://onlctryfnigkxgmhciyb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubGN0cnlmbmlna3hnbWhjaXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5ODEzNTksImV4cCI6MjA3MDU1NzM1OX0.MBAcVUwUXsLv_Z2FaG-iJG8dmt3aNhlavYkL2cE4O8o'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,           // persist session on device
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,       // React Native: no URL parsing
  },
});
