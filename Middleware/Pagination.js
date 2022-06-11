module.exports = function (itemsPerPage = 10) {
    if (itemsPerPage <= 0) {
        throw new Error("Items Per page can't be Negative or Zero!");
    }
    return function (req, res, next) {
        const page = (req.query.page || 1) - 1;
        if (page < 0) {
            res.status(400).json({ error: "Invalid Page" });
        } else {
            const offset = page * itemsPerPage;
            req.page = {
                offset,
                limit: offset + itemsPerPage,
                size: itemsPerPage
            }
            next();
        }
    };
}