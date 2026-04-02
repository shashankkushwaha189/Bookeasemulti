require('dotenv').config();
const sequelize = require('./src/config/database');
const { User, Business } = require('./src/models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✅ Tables ready.');

    // Super Admin
    const superAdminEmail = 'shashankkushwaha189@gmail.com';
    const existing = await User.findOne({ where: { email: superAdminEmail } });
    if (!existing) {
      await User.create({ email: superAdminEmail, password: 'admin123', role: 'SUPER_ADMIN', business_id: null, is_verified: true });
      console.log(`✅ Super Admin created → ${superAdminEmail} / admin123`);
    } else {
      await existing.update({ role: 'SUPER_ADMIN', is_verified: true, business_id: null, password: 'admin123' });
      console.log(`⚠️  Super Admin already exists. Promoted to SUPER_ADMIN and password reset for ${superAdminEmail}`);
    }

    // Sample businesses
    const businesses = [
      { name: 'City Heart Clinic',  category: 'Healthcare',    speciality: 'Cardiology',    address: '12 MG Road, Lucknow',      phone: '0522-1234567', currency: '₹' },
      { name: 'Sunrise Dental',     category: 'Dental',        speciality: 'Orthodontics',  address: '8 Gomti Nagar, Lucknow',   phone: '0522-3456789', currency: '₹' },
      { name: 'Glamour Studio',     category: 'Salon',         speciality: 'Hair & Beauty', address: '45 Hazratganj, Lucknow',   phone: '0522-2222222', currency: '₹' },
      { name: 'Serenity Spa',       category: 'Spa',           speciality: 'Wellness',      address: '34 Gomti Nagar, Lucknow',  phone: '0522-3333333', currency: '₹' },
      { name: 'FitZone Gym',        category: 'Fitness',       speciality: 'Personal Training', address: '56 Aliganj, Lucknow', phone: '0522-4444444', currency: '₹' },
      { name: 'PetCare Vet',        category: 'Veterinary',    speciality: 'Pet Health',    address: '90 Indira Nagar, Lucknow', phone: '0522-5555555', currency: '₹' },
    ];

    for (const biz of businesses) {
      const exists = await Business.findOne({ where: { name: biz.name } });
      if (!exists) {
        await Business.create({ ...biz, is_active: true });
        console.log('✅ Business created → ' + biz.name + ' [' + biz.category + ']');
      }
    }

    console.log('\n🎉 Seed complete!');
    console.log(`   Login: ${superAdminEmail} / admin123`);
    console.log('   Then create admins for each business from Super Admin panel.\n');
    process.exit(0);
  } catch (err) { console.error('❌ Seed failed:', err.message); process.exit(1); }
};

seed();
