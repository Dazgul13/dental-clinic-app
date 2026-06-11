require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Organization = require('./models/Organization');

const migrateOrganizations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const organizations = await Organization.find({});
    console.log(`Found ${organizations.length} organizations to migrate\n`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const org of organizations) {
      const updates = {};
      
      // Generate slug from name if missing
      if (!org.slug) {
        const baseSlug = org.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        updates.slug = baseSlug || `org-${org._id.toString().slice(-6)}`;
      }
      
      // Set status to Approved if missing (assuming existing orgs are active)
      if (!org.status) {
        updates.status = 'Approved';
      }
      
      if (Object.keys(updates).length > 0) {
        await Organization.findByIdAndUpdate(org._id, updates);
        console.log(`✅ Migrated: ${org.name}`);
        console.log(`   slug: ${updates.slug || org.slug}`);
        console.log(`   status: ${updates.status || org.status}`);
        migrated++;
      } else {
        console.log(`⏭️  Skipped: ${org.name} (already has slug and status)`);
        skipped++;
      }
    }
    
    console.log(`\n📊 Migration complete:`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${organizations.length}`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

if (require.main === module) {
  migrateOrganizations();
}

module.exports = { migrateOrganizations };
