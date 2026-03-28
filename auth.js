const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).send("No token");
    }
    try {
        const decoded = jwt.verify (token, "your_secret");
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).send("Invalid token");
    }
    };
    module.exports = authMiddleware;