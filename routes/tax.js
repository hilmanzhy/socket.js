const express = require("express");
const router = express.Router();
const kit = require("vascommkit");

// Controller
const taxController = require("../controllers/taxController.js");

/**
 * City Tax
 */
router.post("/get", (req, res, next) => {
    taxController.get(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post("/create", (req, res, next) => {
    if (!req.body.city)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "city" }
        });
    
    req.body.city = kit.string.titleCase(req.body.city)
    
    taxController.create(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post("/update", (req, res, next) => {
    if (!req.body.city)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "city" }
        });
    if (
        !(
            req.body.city ||
            req.body.tax_rt ||
            req.body.tax_sosial ||
            req.body.tax_bisnis ||
            req.body.tax_publik ||
            req.body.tax_industri
        )
    )
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY"
        });

    req.body.city = kit.string.titleCase(req.body.city)

    taxController.update(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

router.post("/delete", (req, res, next) => {
    if (!req.body.city)
        return req.APP.output.print(req, res, {
            code: "MISSING_KEY",
            data: { missing_parameter: "city" }
        });
    
    req.body.city = kit.string.titleCase(req.body.city)
    
    taxController.delete(req.APP, req, (err, result) => {
        if (err) return req.APP.output.print(req, res, err);

        return req.APP.output.print(req, res, result);
    });
});

module.exports = router;
