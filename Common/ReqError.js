module.exports = (res, error, code = 400) =>
    res.status(code).json({ error });
