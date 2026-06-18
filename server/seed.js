require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Organization = require('./models/Organization');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing data
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    
    // Create organization
    const organization = await Organization.create({
      name: 'Demo Dental Clinic',
      email: 'info@demodental.com',
      phone: '(555) 000-0000',
      slug: 'demo-dental-clinic',
      status: 'Approved',
      address: {
        street: '100 Main Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'USA'
      },
      subscription: {
        plan: 'premium',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    });
    
    // Create admin user
    const adminUser = await User.create({
      organizationId: organization._id,
      username: 'admin',
      email: 'admin@demodental.com',
      password: 'Admin123!',
      role: 'admin'
    });
    
    // Create staff user
    const staffUser = await User.create({
      organizationId: organization._id,
      username: 'staff',
      email: 'staff@demodental.com',
      password: 'Staff123!',
      role: 'staff'
    });
    
    // Create 10 sample patients
    const patients = await Patient.create([
      {
        organizationId: organization._id,
        firstName: 'John',
        lastName: 'Doe',
        dob: new Date('1985-06-15'),
        phone: '(555) 123-4567',
        email: 'john.doe@email.com',
        address: '123 Main St, Springfield, IL 62701',
        medicalHistory: { allergies: ['Penicillin'], conditions: ['Hypertension'] },
        clinicalNotes: [{ date: new Date('2024-01-15'), note: 'Regular checkup - no issues found', dentist: adminUser._id }]
      },
      {
        organizationId: organization._id,
        firstName: 'Jane',
        lastName: 'Smith',
        dob: new Date('1990-03-22'),
        phone: '(555) 987-6543',
        email: 'jane.smith@email.com',
        address: '456 Oak Ave, Springfield, IL 62702',
        medicalHistory: { allergies: ['Latex'], conditions: [] },
        clinicalNotes: [{ date: new Date('2024-02-10'), note: 'Cavity filled on tooth #18', dentist: staffUser._id }]
      },
      {
        organizationId: organization._id,
        firstName: 'Bob',
        lastName: 'Johnson',
        dob: new Date('1978-11-08'),
        phone: '(555) 456-7890',
        email: 'bob.johnson@email.com',
        address: '789 Elm St, Springfield, IL 62703',
        medicalHistory: { allergies: [], conditions: ['Diabetes'] }
      },
      {
        organizationId: organization._id,
        firstName: 'Alice',
        lastName: 'Williams',
        dob: new Date('1995-07-30'),
        phone: '(555) 234-5678',
        email: 'alice.williams@email.com',
        address: '321 Pine Rd, Springfield, IL 62704',
        medicalHistory: { allergies: ['Ibuprofen'], conditions: [] },
        clinicalNotes: [{ date: new Date('2024-01-20'), note: 'Teeth cleaning completed', dentist: adminUser._id }]
      },
      {
        organizationId: organization._id,
        firstName: 'Michael',
        lastName: 'Brown',
        dob: new Date('1982-12-05'),
        phone: '(555) 345-6789',
        email: 'michael.brown@email.com',
        address: '654 Maple Dr, Springfield, IL 62705',
        medicalHistory: { allergies: [], conditions: ['Asthma'] }
      },
      {
        organizationId: organization._id,
        firstName: 'Sarah',
        lastName: 'Davis',
        dob: new Date('1988-04-18'),
        phone: '(555) 567-8901',
        email: 'sarah.davis@email.com',
        address: '987 Birch Ln, Springfield, IL 62706',
        medicalHistory: { allergies: ['Codeine'], conditions: [] },
        clinicalNotes: [{ date: new Date('2024-02-05'), note: 'Root canal on tooth #14', dentist: staffUser._id }]
      },
      {
        organizationId: organization._id,
        firstName: 'David',
        lastName: 'Martinez',
        dob: new Date('1975-09-25'),
        phone: '(555) 678-9012',
        email: 'david.martinez@email.com',
        address: '147 Cedar St, Springfield, IL 62707',
        medicalHistory: { allergies: [], conditions: ['High Cholesterol'] }
      },
      {
        organizationId: organization._id,
        firstName: 'Emily',
        lastName: 'Garcia',
        dob: new Date('1992-01-12'),
        phone: '(555) 789-0123',
        email: 'emily.garcia@email.com',
        address: '258 Spruce Ave, Springfield, IL 62708',
        medicalHistory: { allergies: ['Sulfa drugs'], conditions: [] }
      },
      {
        organizationId: organization._id,
        firstName: 'James',
        lastName: 'Wilson',
        dob: new Date('1980-08-07'),
        phone: '(555) 890-1234',
        email: 'james.wilson@email.com',
        address: '369 Willow Way, Springfield, IL 62709',
        medicalHistory: { allergies: [], conditions: ['Arthritis'] },
        clinicalNotes: [{ date: new Date('2024-01-25'), note: 'Crown placed on tooth #3', dentist: adminUser._id }]
      },
      {
        organizationId: organization._id,
        firstName: 'Lisa',
        lastName: 'Anderson',
        dob: new Date('1987-05-14'),
        phone: '(555) 901-2345',
        email: 'lisa.anderson@email.com',
        address: '741 Ash Blvd, Springfield, IL 62710',
        medicalHistory: { allergies: ['Aspirin'], conditions: [] }
      }
    ]);
    
    // Create 10 appointments
    const today = new Date();
    const appointments = await Appointment.create([
      { organizationId: organization._id, patientId: patients[0]._id, dentistId: adminUser._id, date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), status: 'scheduled', notes: 'Regular checkup' },
      { organizationId: organization._id, patientId: patients[1]._id, dentistId: staffUser._id, date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), status: 'scheduled', notes: 'Follow-up on cavity filling' },
      { organizationId: organization._id, patientId: patients[2]._id, dentistId: adminUser._id, date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), status: 'scheduled', notes: 'Teeth cleaning' },
      { organizationId: organization._id, patientId: patients[3]._id, dentistId: staffUser._id, date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), status: 'scheduled', notes: 'Consultation for braces' },
      { organizationId: organization._id, patientId: patients[4]._id, dentistId: adminUser._id, date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), status: 'scheduled', notes: 'Root canal treatment' },
      { organizationId: organization._id, patientId: patients[5]._id, dentistId: staffUser._id, date: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000), status: 'scheduled', notes: 'Crown fitting' },
      { organizationId: organization._id, patientId: patients[6]._id, dentistId: adminUser._id, date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), status: 'completed', notes: 'Annual checkup completed' },
      { organizationId: organization._id, patientId: patients[7]._id, dentistId: staffUser._id, date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), status: 'scheduled', notes: 'Wisdom tooth extraction' },
      { organizationId: organization._id, patientId: patients[8]._id, dentistId: adminUser._id, date: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000), status: 'completed', notes: 'Filling completed' },
      { organizationId: organization._id, patientId: patients[9]._id, dentistId: staffUser._id, date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), status: 'scheduled', notes: 'Dental implant consultation' }
    ]);
    
    console.log('✅ Seed data created successfully!');
    console.log('🏢 Organization: Demo Dental Clinic (slug: demo-dental-clinic)');
    console.log(`👥 Created ${patients.length} sample patients`);
    console.log(`📅 Created ${appointments.length} sample appointments`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

if (require.main === module) {
  seedData().then(() => {
    console.log('🌱 Seeding complete');
    process.exit(0);
  });
}

module.exports = { seedData };