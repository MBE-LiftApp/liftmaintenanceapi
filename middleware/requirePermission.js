function requirePermission(permissionCode) {
  return (req, res, next) => {
    const permissions = Array.isArray(req.user?.permissions) ? req.user.permissions : [];

    if (!permissions.includes(permissionCode)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

module.exports = requirePermission;