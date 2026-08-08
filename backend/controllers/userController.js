const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mapUserProfile = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  site: user.site,
  phone: user.phone || '',
  location: user.location || '',
  latitude: user.latitude ?? null,
  longitude: user.longitude ?? null,
});

exports.getProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json(mapUserProfile(user));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { name, password, phone, location, latitude, longitude } = req.body;

    if (name !== undefined && !String(name).trim()) {
      return res.status(400).json({ error: 'Name cannot be empty.' });
    }

    const data = {};
    if (name !== undefined) data.name = String(name).trim();
    if (phone !== undefined) data.phone = phone;
    if (location !== undefined) data.location = location;
    if (latitude !== undefined) data.latitude = latitude;
    if (longitude !== undefined) data.longitude = longitude;
    if (password) data.passwordHash = password;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    await prisma.activityLog.create({
      data: {
        action: 'Profile Updated',
        description: `${user.name} updated their profile.`,
        userId: req.user.id,
        userName: user.name,
      },
    });

    res.status(200).json(mapUserProfile(user));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        department: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const mapped = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      site: u.site,
      avatar: u.avatar,
      department: u.department ? u.department.name : 'Unassigned',
      departmentId: u.departmentId,
      joinedAt: u.createdAt.toISOString().split('T')[0],
    }));

    res.status(200).json(mapped);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Only Admin can promote roles
    if (req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Only Admins can change user roles.' });
    }

    const validRoles = ['Admin', 'Asset Manager', 'Department Head', 'Employee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    await prisma.activityLog.create({
      data: {
        action: 'Role Updated',
        description: `${user.name}'s role changed to "${role}" by Admin.`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    await prisma.notification.create({
      data: {
        title: 'Role Updated',
        message: `Your account role has been updated to "${role}".`,
        type: 'info',
        isRead: false,
      },
    });

    res.status(200).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role.' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Active or Inactive.' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status },
    });

    await prisma.activityLog.create({
      data: {
        action: 'User Status Changed',
        description: `${user.name}'s account status set to "${status}".`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    res.status(200).json({ id: user.id, name: user.name, status: user.status });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status.' });
  }
};

exports.updateUserDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentId } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { departmentId: departmentId || null },
    });

    res.status(200).json({ id: user.id, name: user.name, departmentId: user.departmentId });
  } catch (error) {
    console.error('Update user department error:', error);
    res.status(500).json({ error: 'Failed to update user department.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Only Admins can delete users.' });
    }

    if (req.user?.id === id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await prisma.$transaction([
      prisma.department.updateMany({
        where: { managerId: id },
        data: { managerId: null },
      }),
      prisma.allocation.updateMany({
        where: { userId: id },
        data: { userId: null },
      }),
      prisma.booking.updateMany({
        where: { userId: id },
        data: { userId: null },
      }),
      prisma.user.delete({ where: { id } }),
    ]);

    await prisma.activityLog.create({
      data: {
        action: 'User Deleted',
        description: `${user.name} (${user.email}) was removed by Admin.`,
        userId: req.user?.id,
        userName: req.user?.name,
      },
    });

    res.status(200).json({ success: true, id: user.id });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
};
