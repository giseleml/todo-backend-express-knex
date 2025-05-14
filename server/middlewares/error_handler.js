function logRequest (req, res) {
    console.log(req.method, req.originalUrl, res.statusCode);
}

function addErrorReporting (func, message) {
    return async function (req, res) {
        try {
            const result = await func(req, res);
            
            (process.env.NODE_ENV !== 'test') && logRequest(req, res);

            return result
        } catch (err) {
            (process.env.NODE_ENV !== 'test') && logRequest(req, res);
            console.log(`${message} caused by: ${err}`);

            if (err.message.includes('not found')) {
                res.status(404).send({ error: err.message });
                return null;
            }

            // Not always 500, but for simplicity's sake.
            res.status(500).send(`Opps! ${message}.`);
            return null
        }
    }
}

module.exports = addErrorReporting;
