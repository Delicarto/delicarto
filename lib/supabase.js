import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://impphknjgbxcycwqeanc.supabase.co'
const supabaseKey = 'sb_publishable_6laZ-64r6VxznR0k8RCSIw_Nk-XJ90K'
export const supabase = createClient(supabaseUrl, supabaseKey)
