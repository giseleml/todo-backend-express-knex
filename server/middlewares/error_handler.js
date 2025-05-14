function addErrorReporting (func, message) {
    return async function (req, res) {
        try {
            const result = await func(req, res);
            console.log(req.method, req.originalUrl, res.statusCode);
            return result
        } catch (err) {
            console.log(req.method, req.originalUrl, res.statusCode);
            console.log(`${message} caused by: ${err}`);

            // Not always 500, but for simplicity's sake.
            res.status(500).send(`Opps! ${message}.`);
            return null
        }
    }
}

module.exports = addErrorReporting;
