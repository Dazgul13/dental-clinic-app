require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Patient = require('./models/Patient');

const seedTreatmentPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing treatment plans
    await Patient.updateMany({}, { $set: { treatmentPlans: [] } });
    console.log('Cleared existing treatment plans');
    
    const patients = await Patient.find({});
    console.log(`Found ${patients.length} patients`);
    
    const samplePlans = [
      { procedure: 'Comprehensive Oral Exam', cost: 7500, status: 'Completed' },
      { procedure: 'Prophylaxis - Adult', cost: 600, status: 'Completed' },
      { procedure: 'Bitewing X-Rays', cost: 400, status: 'Completed' },
      { procedure: 'Panoramic X-Ray', cost: 1500, status: 'Proposed' },
      { procedure: 'Fluoride Treatment', cost: 500, status: 'Completed' },
      { procedure: 'Dental Sealants', cost: 350, status: 'Proposed' },
      { procedure: 'Composite Filling', cost: 2500, status: 'In Progress' },
      { procedure: 'Root Canal Therapy', cost: 12000, status: 'Proposed' },
      { procedure: 'Crown - Porcelain', cost: 15000, status: 'Proposed' },
      { procedure: 'Teeth Whitening', cost: 8000, status: 'Proposed' },
      { procedure: 'Extraction - Simple', cost: 2000, status: 'Completed' },
      { procedure: 'Dental Implant', cost: 35000, status: 'Proposed' },
      { procedure: 'Bridge - 3 Unit', cost: 28000, status: 'Proposed' },
      { procedure: 'Denture - Partial', cost: 18000, status: 'Proposed' },
      { procedure: 'Orthodontic Consultation', cost: 2000, status: 'Completed' },
      { procedure: 'Gum Scaling', cost: 3500, status: 'In Progress' },
      { procedure: 'Wisdom Tooth Extraction', cost: 5000, status: 'Proposed' },
      { procedure: 'Veneer - Porcelain', cost: 13000, status: 'Proposed' },
      { procedure: 'Night Guard', cost: 6000, status: 'Proposed' },
      { procedure: 'Periodontal Maintenance', cost: 2500, status: 'In Progress' }
    ];

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      
      // Assign 2-4 random plans per patient
      const numPlans = 2 + Math.floor(Math.random() * 3);
      const shuffled = [...samplePlans].sort(() => Math.random() - 0.5);
      const selectedPlans = shuffled.slice(0, numPlans);
      
      selectedPlans.forEach((planTemplate, j) => {
        const plan = {
          toothNumber: ['18', '14', '30', '8', '19', '3', '32', '24'][(i + j) % 8] || null,
          surface: ['MOD', 'O', 'M', 'DO', 'B', null][(i + j) % 6] || null,
          procedure: planTemplate.procedure,
          cost: planTemplate.cost,
          status: planTemplate.status,
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
        };
        
        patient.treatmentPlans.push(plan);
      });
      
      await patient.save();
      console.log(`✅ Added ${patient.treatmentPlans.length} plans to ${patient.firstName} ${patient.lastName}`);
    }
    
    console.log('\n🎉 Sample treatment plans created successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding treatment plans:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

if (require.main === module) {
  seedTreatmentPlans().then(() => {
    process.exit(0);
  });
}

module.exports = { seedTreatmentPlans };
