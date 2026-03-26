// This is a Node-only seed script. Guard execution so bundlers (Vite) won't process it in the browser.
if (typeof window === 'undefined') {
  require('dotenv').config();
  const mongoose = require('mongoose');
  const { User, ROLES } = require('./src/models/User');

  const seed = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');

      // Clear existing users (dev only)
      await User.deleteMany({});
      console.log('🗑  Cleared existing users');

      const users = [
        {
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@bytez.com',
          password: 'Admin@1234',
          role: ROLES.ADMIN,
          department: 'Management',
        },
        {
          firstName: 'Sarah',
          lastName: 'Manager',
          email: 'manager@bytez.com',
          password: 'Manager@1234',
          role: ROLES.MANAGER,
          department: 'Operations',
        },
        {
          firstName: 'John',
          lastName: 'Employee',
          email: 'employee@bytez.com',
          password: 'Employee@1234',
          role: ROLES.EMPLOYEE,
          department: 'Content',
        },
      ];

      for (const userData of users) {
        const user = await User.create(userData);
        console.log(`✅ Created ${user.role}: ${user.email}`);
      }

      console.log('\n🎉 Seed complete! Test accounts:');
      console.log('   Admin:    admin@bytez.com    / Admin@1234');
      console.log('   Manager:  manager@bytez.com  / Manager@1234');
      console.log('   Employee: employee@bytez.com / Employee@1234');

      process.exit(0);
    } catch (err) {
      console.error('❌ Seed failed:', err.message);
      process.exit(1);
    }
  };

  seed();
}