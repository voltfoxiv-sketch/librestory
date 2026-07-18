import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Usage: node scripts/migrateLocalToSupabase.mjs <VITE_SUPABASE_URL> <VITE_SUPABASE_SERVICE_ROLE_KEY> <CLERK_USER_ID>

const supabaseUrl = process.argv[2]
const supabaseServiceKey = process.argv[3]
const clerkUserId = process.argv[4]

if (!supabaseUrl || !supabaseServiceKey || !clerkUserId) {
  console.error("Usage: node migrateLocalToSupabase.mjs <URL> <SERVICE_KEY> <CLERK_USER_ID>")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const adventuresDir = path.resolve(process.cwd(), 'adventures')

async function migrate() {
  if (!fs.existsSync(adventuresDir)) {
    console.log("No local adventures folder found.")
    return
  }

  const files = fs.readdirSync(adventuresDir).filter(f => f.endsWith('.json') && f.startsWith('adventure-'))
  
  console.log(`Found ${files.length} local saves. Starting migration for user ${clerkUserId}...`)

  for (const file of files) {
    const id = file.replace('adventure-', '').replace('.json', '')
    const content = fs.readFileSync(path.join(adventuresDir, file), 'utf-8')
    
    try {
      const data = JSON.parse(content)
      const title = data.playerProfile?.name || 'ADVENTURE'
      
      const { error } = await supabase.from('adventures').upsert({
        id,
        user_id: clerkUserId,
        title,
        data,
        updated_at: new Date(data.lastUpdated || Date.now()).toISOString()
      })
      
      if (error) {
        console.error(`Error migrating ${id}:`, error.message)
      } else {
        console.log(`✅ Migrated ${id} (${title})`)
      }
    } catch (e) {
      console.error(`Failed to parse ${file}:`, e)
    }
  }
  
  console.log("Migration complete!")
}

migrate()
