const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper: create base64 token from user data
const makeToken = (user) =>
  Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role, name: user.name, site: user.site })).toString('base64');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // passwordHash stores plaintext in dev mode (matches seeded passwords)
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ error: 'Your account has been deactivated. Contact your administrator.' });
    }

    const token = makeToken(user);

    res.status(200).json({
      token,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      site: user.site,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to authenticate user.' });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Check if email already registered
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Signup always creates Employee role — only Admin can promote
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: password, // plaintext for dev mode
        role: 'Employee',
        status: 'Active',
        site: 'Main Office',
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'User Registered',
        description: `New employee ${name} (${email}) registered.`,
        userId: user.id,
        userName: user.name,
      },
    });

    const token = makeToken(user);

    res.status(201).json({
      token,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      site: user.site,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    // In dev mode, simply confirm the email exists
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email.' });
    }
    res.status(200).json({ success: true, message: 'Password recovery instructions sent to your email!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate password recovery.' });
  }
};
